import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { logActivity } from '../middleware/activity.js';
import { logger } from '../utils/logger.js';
import {
  createSarvamChatCompletion,
  transcribeSarvamAudio,
  synthesizeSarvamSpeech,
} from '../services/sarvam.js';
import { agriculturalIntelligence } from '../services/agriculturalIntelligence.js';
import { voiceCommandEngine } from '../services/voiceCommandEngine.js';
import prisma from '../config/database.js';

const router = express.Router();

// Language mapping for Sarvam
const LANGUAGE_CODES = {
  'en': 'en-IN',
  'hi': 'hi-IN',
  'pa': 'pa-IN',
  'ta': 'ta-IN',
  'te': 'te-IN',
  'kn': 'kn-IN',
  'mr': 'mr-IN',
  'gu': 'gu-IN',
  'bn': 'bn-IN',
  'ur': 'ur-IN',
  'or': 'or-IN',
  'as': 'as-IN',
  'ml': 'ml-IN',
  'kok': 'kok-IN',
  'mai': 'mai-IN',
  'mni': 'mni-IN',
  'sat': 'sat-IN',
  'brx': 'brx-IN',
  'doi': 'doi-IN',
  'sd': 'sd-IN',
  'ks': 'ks-IN',
  'sa': 'sa-IN',
};

/**
 * Normalize language code to standard format
 * Accepts: 'en', 'hi', 'en-IN', 'hi-IN'
 */
const normalizeLanguageCode = (lang) => {
  if (!lang) return 'en-IN';
  const normalized = lang.toLowerCase().replace('_', '-');
  
  // If it's already in xx-IN format, return as is
  if (normalized.includes('-IN')) return normalized;
  
  // Extract language part and map to xx-IN format
  const parts = normalized.split('-')[0];
  return LANGUAGE_CODES[parts] || 'en-IN';
};

/**
 * Main voice processing endpoint
 * Accepts audio buffer, transcribes, routes to AI, and synthesizes response
 */
router.post('/process', authenticate, logActivity, async (req, res) => {
  try {
    const { audioBuffer, language = 'en', mimeType = 'audio/webm' } = req.body;

    if (!audioBuffer) {
      return res.status(400).json({ error: 'Audio buffer is required' });
    }

    const languageCode = normalizeLanguageCode(language);
    logger.info(`Processing voice in language: ${languageCode}`);

    // Check if it's a voice command
    const currentRoute = req.body.currentRoute || '/farmer/dashboard';
    const commandParse = voiceCommandEngine.parseCommand(transcription, language, currentRoute);
    
    if (commandParse.isCommand && commandParse.command) {
      logger.info(`Detected voice command: ${commandParse.command.name} (confidence: ${commandParse.confidence})`);
      
      // Save command interaction
      try {
        await prisma.voiceInteraction.create({
          data: {
            userId: req.user.id,
            language: languageCode,
            transcription,
            response: `Command: ${commandParse.command.name}`,
            intent: commandParse.type,
            status: 'command_detected',
          },
        });
      } catch (error) {
        logger.warn('Failed to save command interaction:', error);
      }

      return res.json({
        success: true,
        transcription,
        isCommand: true,
        commandType: commandParse.type,
        command: commandParse.command,
        language: languageCode,
      });
    }

    // Step 1: Transcribe audio using Sarvam STT
    let transcription;
    try {
      const audioData = Buffer.from(audioBuffer, 'base64');
      const sttResult = await transcribeSarvamAudio({
        buffer: audioData,
        fileName: 'voice-query.webm',
        mimeType,
        languageCode,
        mode: 'transcribe',
      });

      transcription = sttResult?.transcript || '';
      if (!transcription) {
        return res.status(400).json({ error: 'Could not transcribe audio' });
      }

      logger.info(`Transcribed: "${transcription}"`);
    } catch (error) {
      logger.error('STT Error:', error);
      return res.status(500).json({ error: 'Failed to transcribe audio' });
    }

    // Step 2: Route to AI for agricultural response
    let aiResponse;
    try {
      aiResponse = await routeToAgriculturalAI(transcription, languageCode, req.user);
      
      // Enhance with agricultural intelligence
      aiResponse = await agriculturalIntelligence.enrichResponse(
        aiResponse,
        req.user.id.toString(),
        {
          transcription,
          intent: detectIntent(transcription),
          language: languageCode,
        }
      );
      
      logger.info(`AI Response: "${aiResponse}"`);
    } catch (error) {
      logger.error('AI Routing Error:', error);
      aiResponse = getFallbackResponse(transcription, languageCode);
    }

    // Step 3: Synthesize response using Sarvam TTS
    let audioResponse;
    try {
      const ttsResult = await synthesizeSarvamSpeech({
        text: aiResponse,
        targetLanguageCode: languageCode,
        pace: 1,
      });

      audioResponse = ttsResult.audioBase64;
      logger.info('Successfully synthesized speech');
    } catch (error) {
      logger.error('TTS Error:', error);
      return res.status(500).json({ error: 'Failed to synthesize response' });
    }

    // Step 4: Save interaction to database
    try {
      await prisma.voiceInteraction.create({
        data: {
          userId: req.user.id,
          language: languageCode,
          transcription,
          response: aiResponse,
          audioBase64: audioResponse,
          status: 'completed',
        },
      });
    } catch (error) {
      logger.warn('Failed to save interaction:', error);
      // Don't fail the response if DB save fails
    }

    res.json({
      success: true,
      transcription,
      response: aiResponse,
      audioBase64: audioResponse,
      language: languageCode,
    });
  } catch (error) {
    logger.error('Voice processing error:', error);
    res.status(500).json({ error: 'Failed to process voice request' });
  }
});

/**
 * Stream-based voice processing for real-time responses
 * Supports chunked audio input and streaming responses
 */
router.post('/process-stream', authenticate, logActivity, async (req, res) => {
  try {
    const { audioChunks, language = 'en', mimeType = 'audio/webm' } = req.body;

    if (!audioChunks || !Array.isArray(audioChunks) || audioChunks.length === 0) {
      return res.status(400).json({ error: 'Audio chunks are required' });
    }

    const languageCode = normalizeLanguageCode(language);

    // Combine audio chunks
    const combinedBuffer = Buffer.concat(
      audioChunks.map(chunk => Buffer.from(chunk, 'base64'))
    );

    logger.info(`Processing ${audioChunks.length} audio chunks in language: ${languageCode}`);

    // Transcribe combined audio
    let transcription;
    try {
      const sttResult = await transcribeSarvamAudio({
        buffer: combinedBuffer,
        fileName: 'voice-stream.webm',
        mimeType,
        languageCode,
        mode: 'transcribe',
      });

      transcription = sttResult?.transcript || '';
      if (!transcription) {
        return res.status(400).json({ error: 'Could not transcribe audio' });
      }
    } catch (error) {
      logger.error('Stream STT Error:', error);
      return res.status(500).json({ error: 'Failed to transcribe audio stream' });
    }

    // Get AI response
    let aiResponse;
    try {
      aiResponse = await routeToAgriculturalAI(transcription, languageCode, req.user);
    } catch (error) {
      logger.error('Stream AI Error:', error);
      aiResponse = getFallbackResponse(transcription, languageCode);
    }

    // Synthesize response
    let audioResponse;
    try {
      const ttsResult = await synthesizeSarvamSpeech({
        text: aiResponse,
        targetLanguageCode: languageCode,
        pace: 1,
      });

      audioResponse = ttsResult.audioBase64;
    } catch (error) {
      logger.error('Stream TTS Error:', error);
      return res.status(500).json({ error: 'Failed to synthesize response' });
    }

    // Save interaction
    try {
      await prisma.voiceInteraction.create({
        data: {
          userId: req.user.id,
          language: languageCode,
          transcription,
          response: aiResponse,
          audioBase64: audioResponse,
          status: 'completed',
        },
      });
    } catch (error) {
      logger.warn('Failed to save stream interaction:', error);
    }

    res.json({
      success: true,
      transcription,
      response: aiResponse,
      audioBase64: audioResponse,
      language: languageCode,
      chunksProcessed: audioChunks.length,
    });
  } catch (error) {
    logger.error('Stream voice processing error:', error);
    res.status(500).json({ error: 'Failed to process voice stream' });
  }
});

/**
 * Get voice interaction history
 */
router.get('/history', authenticate, async (req, res) => {
  try {
    const { limit = 20, language } = req.query;

    const where = { userId: req.user.id };
    if (language) where.language = normalizeLanguageCode(language);

    const interactions = await prisma.voiceInteraction.findMany({
      where,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    });

    res.json({ interactions });
  } catch (error) {
    logger.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch interaction history' });
  }
});

/**
 * Route user query to appropriate agricultural AI endpoint
 */
async function routeToAgriculturalAI(transcription, languageCode, user) {
  // Detect intent from transcription
  const intent = detectIntent(transcription);

  let aiResponse = '';

  try {
    switch (intent) {
      case 'crop_recommendation':
        aiResponse = await getCropRecommendation(transcription, languageCode);
        break;

      case 'disease_diagnosis':
        aiResponse = await getDiseaseDiagnosis(transcription, languageCode);
        break;

      case 'pest_management':
        aiResponse = await getPestManagement(transcription, languageCode);
        break;

      case 'soil_health':
        aiResponse = await getSoilHealth(transcription, languageCode);
        break;

      case 'market_prices':
        aiResponse = await getMarketPrices(transcription, languageCode);
        break;

      case 'irrigation':
        aiResponse = await getIrrigationAdvice(transcription, languageCode);
        break;

      case 'fertilizer':
        aiResponse = await getFertilizerAdvice(transcription, languageCode);
        break;

      default:
        aiResponse = await getGeneralAgriculturalAdvice(transcription, languageCode);
    }
  } catch (error) {
    logger.error(`Error routing to ${intent}:`, error);
    aiResponse = getLocalLanguageFallback(
      'I encountered an issue processing your question. Please try again.',
      languageCode
    );
  }

  return aiResponse;
}

/**
 * Intent detection based on keywords
 */
function detectIntent(transcription) {
  const text = transcription.toLowerCase();

  const intents = {
    crop_recommendation: ['crop', 'plant', 'grow', 'sow', 'recommend', 'which crop', 'best crop'],
    disease_diagnosis: ['disease', 'infected', 'sick', 'pest', 'insect', 'damage', 'spots', 'leaf'],
    pest_management: ['pest', 'insect', 'bug', 'worm', 'control', 'spray', 'manage'],
    soil_health: ['soil', 'ph', 'nitrogen', 'fertility', 'nutrients', 'organic', 'earth'],
    market_prices: ['price', 'market', 'rate', 'sell', 'profit', 'commodity', 'demand'],
    irrigation: ['water', 'irrigation', 'rain', 'moisture', 'dry', 'flood', 'drain'],
    fertilizer: ['fertilizer', 'manure', 'dung', 'compost', 'nutrient', 'feed'],
  };

  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return intent;
    }
  }

  return 'general';
}

/**
 * Get crop recommendation advice
 */
async function getCropRecommendation(query, languageCode) {
  const sarvamResponse = await createSarvamChatCompletion({
    messages: [
      {
        role: 'system',
        content: `You are an expert agricultural advisor. Provide crop recommendations based on the farmer's question. 
Keep responses concise and practical. Include crop name, season, and 2-3 key benefits.
Language: ${languageCode}`,
      },
      {
        role: 'user',
        content: `Based on the question: "${query}", provide a crop recommendation suitable for Indian farming conditions.`,
      },
    ],
    temperature: 0.3,
    maxTokens: 300,
  });

  return sarvamResponse.content;
}

/**
 * Get disease diagnosis advice
 */
async function getDiseaseDiagnosis(query, languageCode) {
  const sarvamResponse = await createSarvamChatCompletion({
    messages: [
      {
        role: 'system',
        content: `You are an expert plant pathologist. Diagnose crop diseases based on symptoms described.
Provide: disease name, symptoms, causes, and 2-3 treatment methods.
Keep response concise and practical. Language: ${languageCode}`,
      },
      {
        role: 'user',
        content: `Diagnose the disease based on this description: "${query}"`,
      },
    ],
    temperature: 0.3,
    maxTokens: 350,
  });

  return sarvamResponse.content;
}

/**
 * Get pest management advice
 */
async function getPestManagement(query, languageCode) {
  const sarvamResponse = await createSarvamChatCompletion({
    messages: [
      {
        role: 'system',
        content: `You are a pest management expert. Provide practical pest control solutions.
Include organic and chemical options, application methods, and safety precautions.
Language: ${languageCode}`,
      },
      {
        role: 'user',
        content: `Help manage this pest issue: "${query}"`,
      },
    ],
    temperature: 0.3,
    maxTokens: 350,
  });

  return sarvamResponse.content;
}

/**
 * Get soil health advice
 */
async function getSoilHealth(query, languageCode) {
  const sarvamResponse = await createSarvamChatCompletion({
    messages: [
      {
        role: 'system',
        content: `You are a soil scientist. Provide soil health recommendations.
Include soil testing advice, nutrient management, and improvement methods.
Language: ${languageCode}`,
      },
      {
        role: 'user',
        content: `Advise on soil health: "${query}"`,
      },
    ],
    temperature: 0.3,
    maxTokens: 300,
  });

  return sarvamResponse.content;
}

/**
 * Get market price information
 */
async function getMarketPrices(query, languageCode) {
  const sarvamResponse = await createSarvamChatCompletion({
    messages: [
      {
        role: 'system',
        content: `You are a market analyst for agricultural commodities. Provide market insights.
Include current trends, price expectations, and selling strategies.
Language: ${languageCode}`,
      },
      {
        role: 'user',
        content: `Provide market information: "${query}"`,
      },
    ],
    temperature: 0.3,
    maxTokens: 300,
  });

  return sarvamResponse.content;
}

/**
 * Get irrigation advice
 */
async function getIrrigationAdvice(query, languageCode) {
  const sarvamResponse = await createSarvamChatCompletion({
    messages: [
      {
        role: 'system',
        content: `You are an irrigation management expert. Provide water management advice.
Include irrigation schedule, methods, and water conservation techniques.
Language: ${languageCode}`,
      },
      {
        role: 'user',
        content: `Help with irrigation: "${query}"`,
      },
    ],
    temperature: 0.3,
    maxTokens: 300,
  });

  return sarvamResponse.content;
}

/**
 * Get fertilizer advice
 */
async function getFertilizerAdvice(query, languageCode) {
  const sarvamResponse = await createSarvamChatCompletion({
    messages: [
      {
        role: 'system',
        content: `You are a soil fertility expert. Provide fertilization recommendations.
Include NPK ratios, application timing, and dose calculations.
Language: ${languageCode}`,
      },
      {
        role: 'user',
        content: `Advise on fertilizer use: "${query}"`,
      },
    ],
    temperature: 0.3,
    maxTokens: 300,
  });

  return sarvamResponse.content;
}

/**
 * Get general agricultural advice
 */
async function getGeneralAgriculturalAdvice(query, languageCode) {
  const sarvamResponse = await createSarvamChatCompletion({
    messages: [
      {
        role: 'system',
        content: `You are an experienced agricultural advisor. Answer farming questions comprehensively.
Provide practical, location-appropriate advice for Indian farming.
Keep responses conversational and helpful. Language: ${languageCode}`,
      },
      {
        role: 'user',
        content: query,
      },
    ],
    temperature: 0.5,
    maxTokens: 400,
  });

  return sarvamResponse.content;
}

/**
 * Fallback response when AI routing fails
 */
function getFallbackResponse(query, languageCode) {
  const fallbacks = {
    'en-IN': `I understood your question: "${query}". For detailed agricultural advice, please try again or contact a local agricultural extension officer.`,
    'hi-IN': `आपके सवाल को समझा: "${query}". विस्तृत कृषि सलाह के लिए, कृपया फिर से क���शिश करें या स्थानीय कृषि विस्तार अधिकारी से संपर्क करें।`,
    'pa-IN': `ਮੈਂ ਤੁਹਾਡਾ ਸਵਾਲ ਸਮਝ ਗਿਆ: "${query}". ਵਿਸਥਾਰਤ ਖੇਤੀ ਸਲਾਹ ਲਈ, ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਜਾਂ ਸਥਾਨਕ ਖੇਤੀ ਵਿਸਤਾਰ ਅਧਿਕਾਰੀ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।`,
  };

  return fallbacks[languageCode] || fallbacks['en-IN'];
}

/**
 * Get localized fallback response
 */
function getLocalLanguageFallback(message, languageCode) {
  const responses = {
    'en-IN': message,
    'hi-IN': 'कृपया फिर से प्रयास करें या अपने स्थानीय कृषि अधिकारी से संपर्क करें।',
    'pa-IN': 'ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਜਾਂ ਆਪਣੇ ਸਥਾਨਕ ਖੇਤੀ ਅਧਿਕਾਰੀ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।',
  };

  return responses[languageCode] || responses['en-IN'];
}

export default router;

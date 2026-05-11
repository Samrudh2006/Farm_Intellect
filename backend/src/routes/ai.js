import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth.js';
import { logActivity } from '../middleware/activity.js';
import prisma from '../config/database.js';
import { logger } from '../utils/logger.js';
import { predictYield, forecastPrice, assessPestRisk, recommendCrops, analyzeSoilHealth } from '../services/ml.js';
import { detectDiseaseFromImage, diagnoseDiseaseFromText } from '../services/cv.js';
import { classifyForumPost, analyzeSentiment, summarizeAdvisory, matchGovernmentSchemes, generateCropCalendar } from '../services/nlp.js';
import { runInference } from '../services/inferenceClient.js';

const router = express.Router();

const AI_UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads', 'ai-images');

function isPathInside(baseDir, targetPath) {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(targetPath);
  return resolvedTarget === resolvedBase || resolvedTarget.startsWith(`${resolvedBase}${path.sep}`);
}

function safeUnlink(filePath) {
  if (!filePath || !isPathInside(AI_UPLOADS_ROOT, filePath)) {
    logger.warn('Refused to delete file outside AI uploads directory', { filePath });
    return;
  }

  }
}

const MODEL_VERSIONS = {
  cropRecommendation: { name: 'crop-recommendation', version: '1.0.0' },
  yieldPrediction: { name: 'yield-prediction', version: '1.0.0' },
  priceForecast: { name: 'price-forecast', version: '1.0.0' },
  pestRisk: { name: 'pest-risk', version: '1.0.0' },
  diseaseVision: { name: 'disease-vision', version: '1.0.0' },
};

// Configure multer for AI image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'ai-images');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `ai-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Crop recommendation based on location and soil data
router.post('/recommend-crops', authenticate, logActivity, async (req, res) => {
  try {
    const { location, soilType, season, farmSize, experience, nitrogen, phosphorus, potassium, ph, temperature, humidity, rainfall } = req.body;

    // Real ML-powered crop recommendation
    const { result, source, model } = await runInference({
      endpoint: '/recommend-crops',
      payload: req.body,
      model: MODEL_VERSIONS.cropRecommendation,
      fallback: () =>
        recommendCrops({
          nitrogen: nitrogen || 280,
          phosphorus: phosphorus || 45,
          potassium: potassium || 320,
          ph: ph || 7.0,
          temperature: temperature || 28,
          humidity: humidity || 65,
          rainfall: rainfall || 800,
          season: season === 'winter' ? 'Rabi' : season === 'monsoon' ? 'Kharif' : season === 'summer' ? 'Zaid' : season,
          farmSize,
          experience,
        }),
    });
    const recommendations = result.recommendations || result;

    // Save recommendation to database
    for (const rec of recommendations) {
      await prisma.aiRecommendation.create({
        data: {
          userId: req.user.id,
          type: 'crop',
          title: rec.crop,
          description: rec.reason,
          confidence: rec.confidence,
          data: JSON.stringify(rec)
        }
      });
    }

    res.json({ recommendations, model: { ...model, source } });
  } catch (error) {
    logger.error('Crop recommendation error:', error);
    res.status(500).json({ error: 'Failed to generate crop recommendations' });
  }
});

// Crop disease detection from image
router.post('/detect-disease', authenticate, upload.single('image'), logActivity, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const { cropType } = req.body;

    // Real CV-powered disease detection (Sarvam vision + knowledge base)
    const detection = await detectDiseaseFromImage(req.file.path, cropType);

    // Clean up uploaded file after processing
    setTimeout(() => {
      safeUnlink(req.file.path);
    }, 60000); // Delete after 1 minute

    res.json({
      detection,
      model: {
        ...MODEL_VERSIONS.diseaseVision,
        source: detection.source || 'local',
        fallback: String(detection.source || '').includes('fallback'),
      },
    });
  } catch (error) {
    logger.error('Disease detection error:', error);
    if (req.file) {
      safeUnlink(req.file.path);
    }
    res.status(500).json({ error: 'Failed to detect disease' });
  }
});

// Get AI suggestions for farmers
router.get('/suggestions', authenticate, async (req, res) => {
  try {
    const { type, limit = 10 } = req.query;

    const where = {
      userId: req.user.id,
      isActive: true,
      ...(type && { type })
    };

    const suggestions = await prisma.aiRecommendation.findMany({
      where,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    res.json({ suggestions });
  } catch (error) {
    logger.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Generate yield prediction
router.post('/predict-yield', authenticate, logActivity, async (req, res) => {
  try {
    const { cropType, farmSize, soilQuality, soilParams, irrigation, irrigationMethod, fertilizer, fertilizerTiming, weather, pestPressure } = req.body;

    // Real ML-powered yield prediction
    const { result, source, model } = await runInference({
      endpoint: '/predict-yield',
      payload: req.body,
      model: MODEL_VERSIONS.yieldPrediction,
      fallback: () =>
        predictYield({
          cropType,
          farmSize,
          soilQuality,
          soilParams,
          irrigation,
          irrigationMethod,
          fertilizer,
          fertilizerTiming,
          weather,
          pestPressure,
        }),
    });
    const prediction = result.prediction || result;

    res.json({ prediction, model: { ...model, source } });
  } catch (error) {
    logger.error('Yield prediction error:', error);
    res.status(500).json({ error: 'Failed to predict yield' });
  }
});

// Get preventive tips for experts dashboard
router.get('/preventive-tips', authenticate, async (req, res) => {
  try {
    if (!['EXPERT', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { category, season } = req.query;

    const tips = getPreventiveTips(category, season);

    res.json({ tips });
  } catch (error) {
    logger.error('Get preventive tips error:', error);
    res.status(500).json({ error: 'Failed to fetch preventive tips' });
  }
});

// ─── New ML/NLP/CV Routes ──────────────────────────────────────────────────

// Price forecasting
router.post('/forecast-price', authenticate, logActivity, async (req, res) => {
  try {
    const { commodity, months, currentPrice } = req.body;
    const { result, source, model } = await runInference({
      endpoint: '/forecast-price',
      payload: req.body,
      model: MODEL_VERSIONS.priceForecast,
      fallback: () => forecastPrice({ commodity, months, currentPrice }),
    });
    const forecast = result.forecast || result;
    res.json({ forecast, model: { ...model, source } });
  } catch (error) {
    logger.error('Price forecast error:', error);
    res.status(500).json({ error: 'Failed to forecast prices' });
  }
});

// Pest risk assessment
router.post('/pest-risk', authenticate, logActivity, async (req, res) => {
  try {
    const { cropType, temperature, humidity, season, region, previousPestHistory } = req.body;
    const { result, source, model } = await runInference({
      endpoint: '/pest-risk',
      payload: req.body,
      model: MODEL_VERSIONS.pestRisk,
      fallback: () => assessPestRisk({ cropType, temperature, humidity, season, region, previousPestHistory }),
    });
    const assessment = result.assessment || result;
    res.json({ assessment, model: { ...model, source } });
  } catch (error) {
    logger.error('Pest risk assessment error:', error);
    res.status(500).json({ error: 'Failed to assess pest risk' });
  }
});

// Soil health analysis
router.post('/soil-analysis', authenticate, logActivity, async (req, res) => {
  try {
    const { ph, nitrogen, phosphorus, potassium, organicCarbon, moisture, ec } = req.body;
    const analysis = analyzeSoilHealth({ ph, nitrogen, phosphorus, potassium, organicCarbon, moisture, ec });
    res.json({ analysis });
  } catch (error) {
    logger.error('Soil analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze soil' });
  }
});

// Text-based disease diagnosis (NLP)
router.post('/diagnose-disease', authenticate, logActivity, async (req, res) => {
  try {
    const { description, cropType } = req.body;
    if (!description) return res.status(400).json({ error: 'Symptom description is required' });
    const diagnosis = await diagnoseDiseaseFromText(description, cropType);
    res.json({ diagnosis });
  } catch (error) {
    logger.error('Disease diagnosis error:', error);
    res.status(500).json({ error: 'Failed to diagnose disease' });
  }
});

// Forum post auto-tagging (NLP)
router.post('/classify-post', authenticate, async (req, res) => {
  try {
    const { title, body } = req.body;
    const classification = await classifyForumPost(title, body);
    res.json({ classification });
  } catch (error) {
    logger.error('Post classification error:', error);
    res.status(500).json({ error: 'Failed to classify post' });
  }
});

// Sentiment analysis (NLP)
router.post('/sentiment', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const sentiment = await analyzeSentiment(text);
    res.json({ sentiment });
  } catch (error) {
    logger.error('Sentiment analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});

// Advisory summarization (NLP)
router.post('/summarize', authenticate, async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const summary = await summarizeAdvisory(text, targetLanguage);
    res.json({ summary });
  } catch (error) {
    logger.error('Summarization error:', error);
    res.status(500).json({ error: 'Failed to summarize' });
  }
});

// Government scheme matching (NLP)
router.post('/match-schemes', authenticate, logActivity, async (req, res) => {
  try {
    const { landHolding, cropType, state, category, income } = req.body;
    const schemes = await matchGovernmentSchemes({ landHolding, cropType, state, category, income });
    res.json({ schemes });
  } catch (error) {
    logger.error('Scheme matching error:', error);
    res.status(500).json({ error: 'Failed to match schemes' });
  }
});

// Crop calendar generation (NLP)
router.post('/crop-calendar', authenticate, logActivity, async (req, res) => {
  try {
    const { cropType, location, soilType, sowingDate } = req.body;
    const calendar = await generateCropCalendar({ cropType, location, soilType, sowingDate });
    res.json({ calendar });
  } catch (error) {
    logger.error('Crop calendar error:', error);
    res.status(500).json({ error: 'Failed to generate crop calendar' });
  }
});

// Get preventive tips for experts dashboard
router.get('/preventive-tips', authenticate, async (req, res) => {
  try {
    if (!['EXPERT', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { category, season } = req.query;

    const tips = getPreventiveTips(category, season);

    res.json({ tips });
  } catch (error) {
    logger.error('Get preventive tips error:', error);
    res.status(500).json({ error: 'Failed to fetch preventive tips' });
  }
});

// ─── Helper: Preventive tips (kept as static knowledge base) ──────────────────

const getPreventiveTips = (category, season) => {
  const tipsByCategory = {
    'pest-control': [
      'Regular field monitoring for early pest detection — scout every 3-5 days during critical stages',
      'Install pheromone traps (5-10/hectare) for targeted pest monitoring',
      'Encourage beneficial insects through border crop plantings (marigold, sunflower)',
      'Rotate crops to break pest cycles — follow cereal-pulse-oilseed rotation',
      'Apply neem-based biopesticide (Azadirachtin 0.03%) as preventive spray at 5ml/L',
    ],
    'disease-prevention': [
      'Maintain plant spacing per ICAR guidelines for adequate air circulation',
      'Use disease-resistant varieties — check latest PAU/IARI recommendations',
      'Practice 3-year crop rotation to reduce soil-borne pathogen buildup',
      'Apply Trichoderma viride (5g/L) as preventive foliar spray at 15-day intervals',
      'Remove and destroy infected plant debris — do not compost diseased material',
      'Treat seeds with Carbendazim (2g/kg) or Thiram (2.5g/kg) before sowing',
    ],
    'soil-health': [
      'Get Soil Health Card — free testing at nearest KVK (soilhealth.dac.gov.in)',
      'Apply FYM/compost at 10-15 tonnes/hectare before sowing',
      'Practice green manuring with Dhaincha/Sesbania — 45 days before main crop',
      'Use biofertilizers: Rhizobium (pulses), Azotobacter (cereals), PSB (all crops)',
      'Minimum tillage to preserve soil structure and microbial activity',
      'Maintain organic carbon above 0.5% — add vermicompost 5 tonnes/ha annually',
    ],
    'irrigation': [
      'Monitor soil moisture with tensiometer or hand-feel method before irrigating',
      'Drip irrigation saves 30-50% water — PMKSY subsidy available (55-75%)',
      'Irrigate at critical growth stages: crown root initiation, flowering, grain filling',
      'Avoid waterlogging — ensure proper field drainage channels',
      'Mulching reduces evaporation by 25-35% — use crop residue or plastic mulch',
    ],
  };

  return tipsByCategory[category] || tipsByCategory['pest-control'];
};

export default router;

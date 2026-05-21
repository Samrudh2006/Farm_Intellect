import { logger } from '../utils/logger.js';

const SARVAM_API_BASE_URL = (process.env.SARVAM_API_BASE_URL || 'https://api.sarvam.ai').replace(/\/$/, '');
const DEFAULT_CHAT_MODEL = process.env.SARVAM_CHAT_MODEL || 'sarvam-30b';
const DEFAULT_STT_MODEL = process.env.SARVAM_STT_MODEL || 'saaras:v3';
const DEFAULT_TTS_MODEL = process.env.SARVAM_TTS_MODEL || 'bulbul:v3';
const DEFAULT_TTS_SPEAKER = process.env.SARVAM_TTS_SPEAKER;

const getSarvamApiKey = () => {
  const apiKey = process.env.SARVAM_API_KEY;

  if (!apiKey) {
    throw new Error('Sarvam API key is not configured on the backend.');
  }

  return apiKey;
};

const parseErrorPayload = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      const payload = await response.json();
      return payload?.error?.message || payload?.error || payload?.message || JSON.stringify(payload);
    }

    return (await response.text()) || `Sarvam request failed with status ${response.status}`;
  } catch {
    return `Sarvam request failed with status ${response.status}`;
  }
};

const requestSarvam = async (path, { method = 'POST', headers: customHeaders, body } = {}) => {
  const apiKey = getSarvamApiKey();
  const headers = new Headers(customHeaders || {});

  headers.set('api-subscription-key', apiKey);
  headers.set('Accept', headers.get('Accept') || 'application/json');

  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${apiKey}`);
  }

  const response = await fetch(`${SARVAM_API_BASE_URL}${path}`, {
    method,
    headers,
    body,
  });

  if (!response.ok) {
    const details = await parseErrorPayload(response);
    logger.error('Sarvam API request failed', {
      path,
      status: response.status,
      details,
    });
    throw new Error(details);
  }

  return response.json();
};

export const createSarvamChatCompletion = async ({
  messages,
  model = DEFAULT_CHAT_MODEL,
  temperature = 0.3,
  maxTokens = 700,
}) => {
  const payload = await requestSarvam('/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
  });

  const content = payload?.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error('Sarvam returned an empty chat response.');
  }

  return {
    content,
    raw: payload,
  };
};

export const transcribeSarvamAudio = async ({
  buffer,
  fileName = 'voice-query.webm',
  mimeType = 'audio/webm',
  languageCode,
  mode = 'transcribe',
}) => {
  const formData = new FormData();
  formData.append('file', new Blob([buffer], { type: mimeType }), fileName);
  formData.append('model', DEFAULT_STT_MODEL);
  formData.append('mode', mode);

  if (languageCode) {
    formData.append('language_code', languageCode);
  }

  return requestSarvam('/speech-to-text', {
    body: formData,
  });
};

export const synthesizeSarvamSpeech = async ({
  text,
  targetLanguageCode = 'en-IN',
  speaker = DEFAULT_TTS_SPEAKER,
  pace = 1,
}) => {
  const payload = await requestSarvam('/text-to-speech', {
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_TTS_MODEL,
      text,
      target_language_code: targetLanguageCode,
      ...(speaker ? { speaker } : {}),
      pace,
    }),
  });

  const audioBase64 = payload?.audios?.[0];

  if (!audioBase64) {
    throw new Error('Sarvam did not return synthesized audio.');
  }

  return {
    audioBase64,
    raw: payload,
  };
};

/**
 * Streaming Speech-to-Text with support for long-form audio
 */
export const transcribeSarvamAudioStream = async ({
  buffer,
  fileName = 'voice-stream.webm',
  mimeType = 'audio/webm',
  languageCode,
  mode = 'transcribe',
  onChunk,
}) => {
  const formData = new FormData();
  formData.append('file', new Blob([buffer], { type: mimeType }), fileName);
  formData.append('model', DEFAULT_STT_MODEL);
  formData.append('mode', mode);

  if (languageCode) {
    formData.append('language_code', languageCode);
  }

  const apiKey = getSarvamApiKey();
  const headers = new Headers();
  headers.set('api-subscription-key', apiKey);
  headers.set('Authorization', `Bearer ${apiKey}`);

  const response = await fetch(`${SARVAM_API_BASE_URL}/speech-to-text`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const details = await parseErrorPayload(response);
    logger.error('Sarvam streaming STT failed', { details });
    throw new Error(details);
  }

  return response.json();
};

/**
 * Streaming Text-to-Speech with chunked audio output
 */
export const synthesizeSarvamSpeechStream = async ({
  text,
  targetLanguageCode = 'en-IN',
  speaker = DEFAULT_TTS_SPEAKER,
  pace = 1,
  onChunk,
}) => {
  const payload = await requestSarvam('/text-to-speech', {
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_TTS_MODEL,
      text,
      target_language_code: targetLanguageCode,
      ...(speaker ? { speaker } : {}),
      pace,
    }),
  });

  const audioBase64 = payload?.audios?.[0];

  if (!audioBase64) {
    throw new Error('Sarvam did not return synthesized audio.');
  }

  // Emit chunks if callback provided
  if (onChunk && Array.isArray(payload?.audios)) {
    payload.audios.forEach((chunk, index) => {
      onChunk({
        index,
        total: payload.audios.length,
        audio: chunk,
      });
    });
  }

  return {
    audioBase64,
    raw: payload,
  };
};

/**
 * Multi-turn chat completion with streaming support
 */
export const createSarvamChatCompletionStream = async ({
  messages,
  model = DEFAULT_CHAT_MODEL,
  temperature = 0.3,
  maxTokens = 700,
  onChunk,
}) => {
  const apiKey = getSarvamApiKey();
  const headers = new Headers();
  headers.set('api-subscription-key', apiKey);
  headers.set('Authorization', `Bearer ${apiKey}`);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${SARVAM_API_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    const details = await parseErrorPayload(response);
    logger.error('Sarvam streaming chat failed', { details });
    throw new Error(details);
  }

  // For streaming responses, return the response object for manual handling
  // or process the stream if onChunk is provided
  if (onChunk && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let content = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              const deltaContent = data?.choices?.[0]?.delta?.content || '';
              if (deltaContent) {
                content += deltaContent;
                onChunk(deltaContent);
              }
            } catch (e) {
              // Skip parsing errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return {
      content: content.trim(),
      raw: { streaming: true },
    };
  }

  // Non-streaming fallback
  return response.json().then(payload => {
    const content = payload?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('Sarvam returned an empty chat response.');
    }
    return {
      content,
      raw: payload,
    };
  });
};

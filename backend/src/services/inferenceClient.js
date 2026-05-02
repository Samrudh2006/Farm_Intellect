import { logger } from '../utils/logger.js';

const inferenceBaseUrl = process.env.INFERENCE_SERVICE_URL;

export const runInference = async ({ endpoint, payload, fallback, model }) => {
  const startedAt = Date.now();
  if (!inferenceBaseUrl) {
    const result = await fallback();
    logger.info('Inference completed', { endpoint, source: 'local', model, durationMs: Date.now() - startedAt });
    return { result, source: 'local', model };
  }

  try {
    const response = await fetch(`${inferenceBaseUrl.replace(/\/$/, '')}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.INFERENCE_SERVICE_TOKEN ? { Authorization: `Bearer ${process.env.INFERENCE_SERVICE_TOKEN}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Inference service responded ${response.status}`);
    }

    const data = await response.json();
    logger.info('Inference completed', { endpoint, source: 'inference-service', model, durationMs: Date.now() - startedAt });
    return { result: data, source: 'inference-service', model };
  } catch (error) {
    logger.warn('Inference service unavailable, falling back', { error: error.message });
    const result = await fallback();
    logger.info('Inference completed', { endpoint, source: 'local-fallback', model, durationMs: Date.now() - startedAt });
    return { result, source: 'local-fallback', model };
  }
};

import { logger } from '../utils/logger.js';

const inferenceBaseUrl = process.env.INFERENCE_SERVICE_URL;
const INFERENCE_TIMEOUT_MS = parseInt(process.env.INFERENCE_TIMEOUT_MS || '8000', 10);
const INFERENCE_MAX_RETRIES = parseInt(process.env.INFERENCE_MAX_RETRIES || '2', 10);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const runInference = async ({ endpoint, payload, fallback, model }) => {
  const startedAt = Date.now();
  if (!inferenceBaseUrl) {
    const result = await fallback();
    logger.info('Inference completed', { endpoint, source: 'local', model, durationMs: Date.now() - startedAt });
    return { result, source: 'local', model };
  }

  try {
    let lastError;

    for (let attempt = 0; attempt <= INFERENCE_MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), INFERENCE_TIMEOUT_MS);

      try {
        const response = await fetch(`${inferenceBaseUrl.replace(/\/$/, '')}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.INFERENCE_SERVICE_TOKEN ? { Authorization: `Bearer ${process.env.INFERENCE_SERVICE_TOKEN}` } : {}),
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Inference service responded ${response.status}`);
        }

        const data = await response.json();
        logger.info('Inference completed', { endpoint, source: 'inference-service', model, durationMs: Date.now() - startedAt, attempt: attempt + 1 });
        return { result: data, source: 'inference-service', model };
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;
        if (attempt < INFERENCE_MAX_RETRIES) {
          await delay(250 * (attempt + 1));
        }
      }
    }

    throw lastError;
  } catch (error) {
    logger.warn('Inference service unavailable, falling back', { error: error.message });
    const result = await fallback();
    logger.info('Inference completed', { endpoint, source: 'local-fallback', model, durationMs: Date.now() - startedAt });
    return { result, source: 'local-fallback', model };
  }
};

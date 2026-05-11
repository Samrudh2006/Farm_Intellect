const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'authorization',
  'apiKey',
  'apikey',
  'jwt',
  'refresh',
  'access',
  'otp',
  'code',
  'privateKey',
  'auth',
];

const MAX_LOG_VALUE_LENGTH = 1000;
const MAX_LOG_DEPTH = 6;

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);

export const sanitizeUserText = (value) => {
  if (value === null || value === undefined) {
    return value;
  }
  const normalized = String(value).trim();
  if (!normalized) {
    return '';
  }
  return escapeHtml(normalized);
};

const truncateValue = (value) => {
  if (typeof value !== 'string') {
    return value;
  }
  if (value.length <= MAX_LOG_VALUE_LENGTH) {
    return value;
  }
  return `${value.slice(0, MAX_LOG_VALUE_LENGTH)}…`;
};

const shouldRedactKey = (key) => {
  const normalized = String(key || '').toLowerCase();
  return SENSITIVE_KEYS.some((sensitive) => normalized.includes(sensitive.toLowerCase()));
};

const sanitizeForLog = (value, depth, seen) => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return truncateValue(value);
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (seen.has(value)) {
    return '[Circular]';
  }

  if (depth >= MAX_LOG_DEPTH) {
    return '[Truncated]';
  }

  seen.add(value);

  if (Array.isArray(value)) {
    const sanitizedArray = value.map((item) => sanitizeForLog(item, depth + 1, seen));
    seen.delete(value);
    return sanitizedArray;
  }

  const sanitized = Object.entries(value).reduce((acc, [key, nestedValue]) => {
    if (shouldRedactKey(key)) {
      acc[key] = '[REDACTED]';
      return acc;
    }
    acc[key] = sanitizeForLog(nestedValue, depth + 1, seen);
    return acc;
  }, {});

  seen.delete(value);
  return sanitized;
};

export const sanitizeActivityPayload = (payload) => {
  const seen = new WeakSet();
  return sanitizeForLog(payload, 0, seen);
};

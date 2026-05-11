import prisma from '../config/database.js';
import { logger } from '../utils/logger.js';

const SENSITIVE_KEYS = new Set(['password', 'passkey', 'token', 'otp', 'otpCode', 'authorization']);

function redactSensitive(value) {
  if (Array.isArray(value)) return value.map(redactSensitive);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, SENSITIVE_KEYS.has(k) ? '[REDACTED]' : redactSensitive(v)]));
  }
  return value;
}

export const logActivity = async (req, res, next) => {
  // Store original end function
  const originalEnd = res.end;
  
  res.end = function(...args) {
    // Log activity after response is sent
    if (req.user && req.method !== 'GET') {
      setImmediate(async () => {
        try {
          await prisma.activity.create({
            data: {
              userId: req.user.id,
              action: `${req.method} ${req.originalUrl}`,
              description: `${req.method} request to ${req.originalUrl}`,
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get('User-Agent'),
              metadata: JSON.stringify({
                body: redactSensitive(req.body),
                params: redactSensitive(req.params),
                query: redactSensitive(req.query)
              })
            }
          });
        } catch (error) {
          logger.error('Failed to log activity:', error);
        }
      });
    }
    
    // Call original end function
    originalEnd.apply(this, args);
  };
  
  next();
};
import prisma from '../config/database.js';
import { logger } from '../utils/logger.js';
import { sanitizeActivityPayload } from '../utils/sanitize.js';

export const logActivity = async (req, res, next) => {
  // Store original end function
  const originalEnd = res.end;
  
  res.end = function(...args) {
    // Log activity after response is sent
    if (req.user && req.method !== 'GET') {
      setImmediate(async () => {
        try {
          const auditMetadata = sanitizeActivityPayload({
            body: req.body,
            params: req.params,
            query: req.query,
            ...(req.auditBefore || req.auditAfter
              ? { audit: { before: req.auditBefore, after: req.auditAfter } }
              : {}),
          });

          await prisma.activity.create({
            data: {
              userId: req.user.id,
              action: `${req.method} ${req.originalUrl}`,
              description: `${req.method} request to ${req.originalUrl}`,
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get('User-Agent'),
              metadata: JSON.stringify(auditMetadata),
            },
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

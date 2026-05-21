import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import { resolveAuthenticatedUser, authenticate, authorize } from './middleware/auth.js';
import * as Sentry from '@sentry/node';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import documentRoutes from './routes/documents.js';
import notificationRoutes from './routes/notifications.js';
import forumRoutes from './routes/forum.js';
import chatRoutes from './routes/chat.js';
import analyticsRoutes from './routes/analytics.js';
import calendarRoutes from './routes/calendar.js';
import aiRoutes from './routes/ai.js';
import voiceRoutes from './routes/voice.js';
import farmRoutes from './routes/farm.js';
import marketRoutes from './routes/market.js';
import pollRoutes from './routes/polls.js';
import datasetRoutes from './routes/datasets.js';
import { scheduleIngestionJobs } from './jobs/ingestion.js';

import { errorHandler } from './middleware/errorHandler.js';
import { metricsHandler, metricsMiddleware } from './middleware/metrics.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
app.disable('x-powered-by');
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts. Please try again later.'
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: 'Too many AI requests. Please slow down and try again shortly.'
});

const chatLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  message: 'Too many chat requests. Please wait a bit before sending more messages.'
});

const allowedOrigin = process.env.NODE_ENV === 'production'
  ? process.env.FRONTEND_URL
  : 'http://localhost:5173';

// Middleware
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1,
  });
  app.use(Sentry.Handlers.requestHandler());
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:', 'wss:'],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
  }),
);

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';
const FORCE_HTTPS = process.env.NODE_ENV === 'production' && process.env.FORCE_HTTPS === 'true';

app.use((req, res, next) => {
  if (!MAINTENANCE_MODE) {
    next();
    return;
  }

  if (req.path === '/health') {
    next();
    return;
  }

  res.status(503).json({
    error: 'Service temporarily unavailable for maintenance',
    maintenance: true,
  });
});


if (FORCE_HTTPS) {
  app.enable('trust proxy');
  app.use((req, res, next) => {
    const forwardedProto = req.get('x-forwarded-proto');
    if (forwardedProto && forwardedProto !== 'https') {
      return res.redirect(301, `https://${req.get('host')}${req.originalUrl}`);
    }
    next();
  });
}

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(metricsMiddleware);

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/chat', chatLimiter, chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/voice', aiLimiter, voiceRoutes);
app.use('/api/farm', farmRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/datasets', datasetRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', maintenance: MAINTENANCE_MODE, timestamp: new Date().toISOString() });
});

app.get('/metrics', authenticate, authorize('ADMIN'), metricsHandler);

// Socket.IO JWT authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.replace('Bearer ', '');
  if (!token) {
    return next(new Error('Authentication required'));
  }
  resolveAuthenticatedUser(token)
    .then((user) => {
      if (!user) {
        next(new Error('Invalid token'));
        return;
      }

      socket.userId = user.id;
      socket.userRole = user.role;
      next();
    })
    .catch(() => next(new Error('Invalid token')));
});

// Socket.IO for real-time features
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Only allow joining the room that matches the authenticated user
  socket.on('join-user-room', () => {
    socket.join(`user-${socket.userId}`);
  });

  socket.on('send-message', (data) => {
    // Sender must be the authenticated user
    if (String(data.senderId) !== String(socket.userId)) return;
    socket.to(`user-${data.recipientId}`).emit('new-message', data);
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

if (process.env.NODE_ENV !== 'test') {
  scheduleIngestionJobs();
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

export { app, server, io };

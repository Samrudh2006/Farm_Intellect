import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { logActivity } from '../middleware/activity.js';
import prisma from '../config/database.js';
import { logger } from '../utils/logger.js';
import { io } from '../server.js';
import { sendNotificationToUser } from '../services/notificationService.js';
import { ensureNotificationPreference, registerDeviceToken } from '../services/notificationService.js';

const router = express.Router();

// Get user notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      userId: req.user.id,
      deletedAt: null,
      ...(unreadOnly === 'true' && { isRead: false })
    };

    const notifications = await prisma.notification.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.notification.count({ where });
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false, deletedAt: null }
    });

    res.json({
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get notification preferences
router.get('/preferences', authenticate, async (req, res) => {
  try {
    const preference = await ensureNotificationPreference(req.user.id);
    res.json({ preference });
  } catch (error) {
    logger.error('Get notification preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
});

// Update notification preferences
router.put('/preferences', authenticate, logActivity, async (req, res) => {
  try {
    const { email, sms, whatsapp, push, inApp } = req.body || {};
    const preference = await prisma.notificationPreference.upsert({
      where: { userId: req.user.id },
      update: {
        email: Boolean(email),
        sms: Boolean(sms),
        whatsapp: Boolean(whatsapp),
        push: Boolean(push),
        inApp: Boolean(inApp),
      },
      create: {
        userId: req.user.id,
        email: Boolean(email),
        sms: Boolean(sms),
        whatsapp: Boolean(whatsapp),
        push: Boolean(push),
        inApp: Boolean(inApp),
      },
    });

    res.json({ preference });
  } catch (error) {
    logger.error('Update notification preferences error:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// Register a device token for push notifications
router.post('/devices', authenticate, logActivity, async (req, res) => {
  try {
    const { token, platform } = req.body || {};
    if (!token || !platform) {
      return res.status(400).json({ error: 'Token and platform are required' });
    }

    const device = await registerDeviceToken({ userId: req.user.id, token, platform });
    res.status(201).json({ device });
  } catch (error) {
    logger.error('Register device token error:', error);
    res.status(500).json({ error: 'Failed to register device token' });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, logActivity, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.user.id, deletedAt: null }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    logger.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', authenticate, logActivity, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false, deletedAt: null },
      data: { isRead: true }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    logger.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// Create notification (for system use)
router.post('/', authenticate, async (req, res) => {
  try {
    // Only admins can create notifications for other users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { userId, title, message, type = 'INFO', data } = req.body;

    const notification = await sendNotificationToUser({ userId, title, message, type, data });

    // Send real-time notification
    if (io) {
      io.to(`user-${userId}`).emit('new-notification', notification);
    }

    res.status(201).json({ notification });
  } catch (error) {
    logger.error('Create notification error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Delete notification
router.delete('/:id', authenticate, logActivity, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.user.id, deletedAt: null }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    res.json({ message: 'Notification archived' });
  } catch (error) {
    logger.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;

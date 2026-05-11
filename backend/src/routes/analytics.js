import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { logActivity } from '../middleware/activity.js';
import prisma from '../config/database.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get analytics data based on user role
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const { role, id: userId } = req.user;

    let analytics = {};

    switch (role) {
      case 'FARMER':
        analytics = await getFarmerAnalytics(userId, timeframe);
        break;
      case 'MERCHANT':
        analytics = await getMerchantAnalytics(userId, timeframe);
        break;
      case 'EXPERT':
        analytics = await getExpertAnalytics(userId, timeframe);
        break;
      case 'ADMIN':
        analytics = await getAdminAnalytics(timeframe);
        break;
      default:
        return res.status(403).json({ error: 'Invalid role' });
    }

    res.json({ analytics });
  } catch (error) {
    logger.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get user activity history
router.get('/activity', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const activities = await prisma.activity.findMany({
      where: { userId: req.user.id },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.activity.count({
      where: { userId: req.user.id }
    });

    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Helper functions for role-specific analytics
const getFarmerAnalytics = async (userId, timeframe) => {
  const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    totalCrops,
    totalNotifications,
    documentsUploaded,
    forumPosts,
    aiInteractions
  ] = await Promise.all([
    prisma.cropCalendar.count({ where: { userId, deletedAt: null } }),
    prisma.notification.count({ 
      where: { userId, deletedAt: null, createdAt: { gte: startDate } } 
    }),
    prisma.document.count({ where: { userId, deletedAt: null } }),
    prisma.post.count({ 
      where: { authorId: userId, createdAt: { gte: startDate } } 
    }),
    prisma.chatMessage.count({ 
      where: { userId, type: 'USER', deletedAt: null, createdAt: { gte: startDate } } 
    })
  ]);

  return {
    totalCrops,
    totalNotifications,
    documentsUploaded,
    forumPosts,
    aiInteractions,
    timeframe
  };
};

const getMerchantAnalytics = async (userId, timeframe) => {
  const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // For merchants, show farmer connections and interactions
  const [
    totalNotifications,
    documentsUploaded,
    forumPosts,
    activities
  ] = await Promise.all([
    prisma.notification.count({ 
      where: { userId, deletedAt: null, createdAt: { gte: startDate } } 
    }),
    prisma.document.count({ where: { userId, deletedAt: null } }),
    prisma.post.count({ 
      where: { authorId: userId, createdAt: { gte: startDate } } 
    }),
    prisma.activity.count({ 
      where: { userId, createdAt: { gte: startDate } } 
    })
  ]);

  return {
    totalNotifications,
    documentsUploaded,
    forumPosts,
    activities,
    timeframe
  };
};

const getExpertAnalytics = async (userId, timeframe) => {
  const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    consultations,
    forumPosts,
    documentsVerified,
    aiRecommendations
  ] = await Promise.all([
    prisma.activity.count({ 
      where: { 
        userId, 
        action: { contains: 'consultation' },
        createdAt: { gte: startDate } 
      } 
    }),
    prisma.post.count({ 
      where: { authorId: userId, createdAt: { gte: startDate } } 
    }),
    prisma.document.count({ 
      where: { 
        deletedAt: null,
        verifiedAt: { gte: startDate }
        // Note: In real app, track who verified
      } 
    }),
    prisma.aiRecommendation.count({ 
      where: { createdAt: { gte: startDate } } 
    })
  ]);

  return {
    consultations,
    forumPosts,
    documentsVerified,
    aiRecommendations,
    timeframe
  };
};

const getAdminAnalytics = async (timeframe) => {
  const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersInPeriod,
    totalDocuments,
    pendingDocuments,
    totalPosts,
    totalNotifications,
    usersByRole
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startDate } } }),
    prisma.document.count({ where: { deletedAt: null } }),
    prisma.document.count({ where: { isVerified: false, deletedAt: null } }),
    prisma.post.count({ where: { createdAt: { gte: startDate } } }),
    prisma.notification.count({ where: { deletedAt: null, createdAt: { gte: startDate } } }),
    prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    })
  ]);

  const roleDistribution = usersByRole.reduce((acc, item) => {
    acc[item.role] = item._count.role;
    return acc;
  }, {});

  return {
    totalUsers,
    newUsersInPeriod,
    totalDocuments,
    pendingDocuments,
    totalPosts,
    totalNotifications,
    roleDistribution,
    timeframe
  };
};

export default router;

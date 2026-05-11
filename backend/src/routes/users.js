import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import prisma from '../config/database.js';
import { logger } from '../utils/logger.js';
import { sanitizeUserText } from '../utils/sanitize.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const { password: _, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    const sanitizedName = name ? sanitizeUserText(name) : undefined;
    const sanitizedLocation = location ? sanitizeUserText(location) : undefined;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(sanitizedName && { name: sanitizedName }),
        ...(phone && { phone }),
        ...(sanitizedLocation && { location: sanitizedLocation })
      },
      include: {
        farmerProfile: true,
        merchantProfile: true,
        expertProfile: true
      }
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get farmers (for merchants and experts)
router.get('/farmers', authenticate, authorize('MERCHANT', 'EXPERT', 'ADMIN'), async (req, res) => {
  try {
    const { search, location, cropType, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      role: 'FARMER',
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(location && { location: { contains: location, mode: 'insensitive' } })
    };

    const farmers = await prisma.user.findMany({
      where,
      include: {
        farmerProfile: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        isVerified: true,
        createdAt: true,
        farmerProfile: {
          select: {
            farmSize: true,
            cropTypes: true,
            experience: true,
            latitude: true,
            longitude: true
          }
        }
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({ where });

    res.json({
      farmers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get farmers error:', error);
    res.status(500).json({ error: 'Failed to fetch farmers' });
  }
});

// Get experts (for farmer consultations)
router.get('/experts', authenticate, async (_req, res) => {
  try {
    const experts = await prisma.user.findMany({
      where: { role: 'EXPERT' },
      include: { expertProfile: true },
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
        phone: true,
        location: true,
        expertProfile: {
          select: {
            specialization: true,
            experience: true,
            rating: true,
            consultations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (experts.length > 0) {
      return res.json({ experts });
    }

    return res.json({
      experts: [
        {
          id: 'seed-expert-1',
          name: 'Dr. Kavita Sharma',
          role: 'EXPERT',
          location: 'Punjab',
          expertProfile: {
            specialization: 'Plant Pathology & Crop Disease',
            experience: 15,
            rating: 4.9,
            consultations: 1247
          }
        },
        {
          id: 'seed-expert-2',
          name: 'Dr. Arjun Patel',
          role: 'EXPERT',
          location: 'Gujarat',
          expertProfile: {
            specialization: 'Soil Health & Irrigation',
            experience: 12,
            rating: 4.8,
            consultations: 892
          }
        },
        {
          id: 'seed-expert-3',
          name: 'Dr. Meera Singh',
          role: 'EXPERT',
          location: 'Haryana',
          expertProfile: {
            specialization: 'Market Linkage & Government Schemes',
            experience: 10,
            rating: 4.7,
            consultations: 654
          }
        },
        {
          id: 'seed-expert-4',
          name: 'Dr. Rajesh Kumar',
          role: 'EXPERT',
          location: 'Maharashtra',
          expertProfile: {
            specialization: 'Pest Control & Organic Farming',
            experience: 18,
            rating: 4.9,
            consultations: 1089
          }
        }
      ]
    });
  } catch (error) {
    logger.error('Get experts error:', error);
    res.status(500).json({ error: 'Failed to fetch experts' });
  }
});

export default router;

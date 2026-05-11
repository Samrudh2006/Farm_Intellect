import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { logActivity } from '../middleware/activity.js';
import prisma from '../config/database.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get crop calendar entries
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, stage, cropType } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      userId: req.user.id,
      deletedAt: null,
      ...(stage && { stage }),
      ...(cropType && { cropType: { contains: cropType, mode: 'insensitive' } })
    };

    const entries = await prisma.cropCalendar.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { plantingDate: 'asc' }
    });

    const total = await prisma.cropCalendar.count({ where });

    res.json({
      entries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get calendar error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar entries' });
  }
});

// Create new crop calendar entry
router.post('/', authenticate, logActivity, async (req, res) => {
  try {
    const { cropType, plantingDate, harvestDate, stage, reminders, notes } = req.body;

    if (!cropType || !plantingDate || !stage) {
      return res.status(400).json({ error: 'Crop type, planting date, and stage are required' });
    }

    const entry = await prisma.cropCalendar.create({
      data: {
        userId: req.user.id,
        cropType,
        plantingDate: new Date(plantingDate),
        harvestDate: harvestDate ? new Date(harvestDate) : null,
        stage,
        reminders: reminders ? JSON.stringify(reminders) : null,
        notes
      }
    });

    // Create notifications for reminders
    if (reminders && reminders.length > 0) {
      for (const reminder of reminders) {
        const reminderDate = new Date(reminder.date);
        if (reminderDate > new Date()) {
          await prisma.notification.create({
            data: {
              userId: req.user.id,
              title: 'Crop Calendar Reminder',
              message: reminder.message || `Reminder for ${cropType}: ${reminder.task}`,
              type: 'REMINDER'
            }
          });
        }
      }
    }

    res.status(201).json({ entry });
  } catch (error) {
    logger.error('Create calendar entry error:', error);
    res.status(500).json({ error: 'Failed to create calendar entry' });
  }
});

// Update crop calendar entry
router.patch('/:id', authenticate, logActivity, async (req, res) => {
  try {
    const { id } = req.params;
    const { cropType, plantingDate, harvestDate, stage, reminders, notes } = req.body;

    const existingEntry = await prisma.cropCalendar.findFirst({
      where: { id, userId: req.user.id, deletedAt: null }
    });

    if (!existingEntry) {
      return res.status(404).json({ error: 'Calendar entry not found' });
    }

    const updatedEntry = await prisma.cropCalendar.update({
      where: { id },
      data: {
        ...(cropType && { cropType }),
        ...(plantingDate && { plantingDate: new Date(plantingDate) }),
        ...(harvestDate && { harvestDate: new Date(harvestDate) }),
        ...(stage && { stage }),
        ...(reminders && { reminders: JSON.stringify(reminders) }),
        ...(notes !== undefined && { notes })
      }
    });

    res.json({ entry: updatedEntry });
  } catch (error) {
    logger.error('Update calendar entry error:', error);
    res.status(500).json({ error: 'Failed to update calendar entry' });
  }
});

// Delete crop calendar entry
router.delete('/:id', authenticate, logActivity, async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await prisma.cropCalendar.findFirst({
      where: { id, userId: req.user.id, deletedAt: null }
    });

    if (!entry) {
      return res.status(404).json({ error: 'Calendar entry not found' });
    }

    await prisma.cropCalendar.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    res.json({ message: 'Calendar entry archived successfully' });
  } catch (error) {
    logger.error('Delete calendar entry error:', error);
    res.status(500).json({ error: 'Failed to delete calendar entry' });
  }
});

// Get upcoming reminders
router.get('/reminders', authenticate, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const endDate = new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000);

    const entries = await prisma.cropCalendar.findMany({
      where: {
        userId: req.user.id,
        deletedAt: null,
        reminders: { not: null }
      }
    });

    const upcomingReminders = [];

    entries.forEach(entry => {
      if (entry.reminders) {
        try {
          const reminders = JSON.parse(entry.reminders);
          reminders.forEach(reminder => {
            const reminderDate = new Date(reminder.date);
            if (reminderDate <= endDate && reminderDate >= new Date()) {
              upcomingReminders.push({
                id: entry.id,
                cropType: entry.cropType,
                reminderDate,
                task: reminder.task,
                message: reminder.message,
                priority: reminder.priority || 'medium'
              });
            }
          });
        } catch (error) {
          logger.error('Error parsing reminders:', error);
        }
      }
    });

    upcomingReminders.sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate));

    res.json({ reminders: upcomingReminders });
  } catch (error) {
    logger.error('Get reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Get crop stages
router.get('/stages', authenticate, async (req, res) => {
  try {
    const stages = [
      'planning',
      'land-preparation',
      'sowing',
      'germination',
      'vegetative',
      'flowering',
      'fruiting',
      'maturation',
      'harvesting',
      'post-harvest'
    ];

    res.json({ stages });
  } catch (error) {
    logger.error('Get stages error:', error);
    res.status(500).json({ error: 'Failed to fetch stages' });
  }
});

export default router;

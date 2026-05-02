import express from 'express';
import { authenticate } from '../middleware/auth.js';
import prisma from '../config/database.js';
import { getDatasetMetadata } from '../services/datasets.js';

const router = express.Router();

router.get('/fields', authenticate, async (req, res) => {
  const fields = await prisma.field.findMany({
    where: {
      OR: [{ ownerId: req.user?.id || undefined }, { ownerId: null }],
    },
    orderBy: { lastUpdated: 'desc' },
  });
  const metadata = await getDatasetMetadata('farm-fields');
  res.json({ metadata, fields });
});

router.get('/sensors', authenticate, async (req, res) => {
  const sensors = await prisma.sensor.findMany({
    where: {
      OR: [{ field: { ownerId: req.user?.id || undefined } }, { fieldId: null }],
    },
    orderBy: { lastReading: 'desc' },
  });
  const metadata = await getDatasetMetadata('farm-sensors');
  res.json({ metadata, sensors });
});

export default router;

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import prisma from '../config/database.js';
import { getDatasetMetadata } from '../services/datasets.js';

const router = express.Router();

router.get('/merchants', authenticate, async (_req, res) => {
  const merchants = await prisma.merchant.findMany({ orderBy: { rating: 'desc' } });
  const metadata = await getDatasetMetadata('market-merchants');
  res.json({ metadata, merchants });
});

router.get('/demand', authenticate, async (_req, res) => {
  const demand = await prisma.cropDemand.findMany({ orderBy: { lastUpdated: 'desc' } });
  const metadata = await getDatasetMetadata('market-demand');
  res.json({ metadata, demand });
});

export default router;

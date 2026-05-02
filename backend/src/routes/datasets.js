import express from 'express';
import { authenticate } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = express.Router();

router.get('/metadata', authenticate, async (_req, res) => {
  const metadata = await prisma.datasetMetadata.findMany({ orderBy: { key: 'asc' } });
  res.json({
    metadata: metadata.map((entry) => ({
      key: entry.key,
      version: entry.version,
      lastUpdated: entry.lastUpdated.toISOString(),
      source: entry.source || undefined,
      notes: entry.notes || undefined,
    })),
  });
});

export default router;

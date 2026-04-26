import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { cropDemand, merchants } from '../data/market.js';

const router = express.Router();

router.get('/merchants', authenticate, async (_req, res) => {
  res.json({ merchants });
});

router.get('/demand', authenticate, async (_req, res) => {
  res.json({ demand: cropDemand });
});

export default router;

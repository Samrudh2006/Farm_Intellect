import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { fields, sensors } from '../data/farm.js';

const router = express.Router();

router.get('/fields', authenticate, async (_req, res) => {
  res.json({ fields });
});

router.get('/sensors', authenticate, async (_req, res) => {
  res.json({ sensors });
});

export default router;

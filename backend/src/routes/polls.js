import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { logActivity } from '../middleware/activity.js';
import { createPoll, listPolls, votePoll } from '../data/polls.js';

const router = express.Router();

router.get('/', authenticate, async (_req, res) => {
  res.json({ polls: listPolls() });
});

router.post('/', authenticate, logActivity, async (req, res) => {
  const { title, description, category, options, endDate, region } = req.body || {};
  if (!title || !description || !category || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: 'Title, description, category, and at least two options are required' });
  }

  const poll = createPoll({
    title,
    description,
    category,
    options: options.filter(Boolean),
    endDate,
    region: region || req.user?.location || 'All India',
    creator: req.user?.name || 'Community Member'
  });

  return res.status(201).json({ poll });
});

router.post('/:id/vote', authenticate, logActivity, async (req, res) => {
  const { id } = req.params;
  const { optionId } = req.body || {};
  if (!optionId) {
    return res.status(400).json({ error: 'Option ID is required' });
  }

  const poll = votePoll({ pollId: id, optionId });
  if (!poll) {
    return res.status(404).json({ error: 'Poll or option not found' });
  }

  return res.json({ poll });
});

export default router;

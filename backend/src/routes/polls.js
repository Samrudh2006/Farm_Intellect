import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { logActivity } from '../middleware/activity.js';
import prisma from '../config/database.js';
import { getDatasetMetadata, touchDatasetMetadata } from '../services/datasets.js';
import { sanitizeUserText } from '../utils/sanitize.js';

const formatPoll = (poll) => {
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  return {
    ...poll,
    totalVotes,
    options: poll.options.map((option) => ({
      ...option,
      percentage: totalVotes ? Math.round((option.votes / totalVotes) * 100) : 0,
    })),
  };
};

const router = express.Router();

router.get('/', authenticate, async (_req, res) => {
  const polls = await prisma.poll.findMany({
    include: { options: true },
    orderBy: { createdAt: 'desc' },
  });
  const metadata = await getDatasetMetadata('community-polls');
  res.json({ metadata, polls: polls.map(formatPoll) });
});

  router.post('/', authenticate, logActivity, async (req, res) => {
    const { title, description, category, options, endDate, region } = req.body || {};
    if (!title || !description || !category || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'Title, description, category, and at least two options are required' });
    }

    const sanitizedTitle = sanitizeUserText(title);
    const sanitizedDescription = sanitizeUserText(description);
    const sanitizedCategory = sanitizeUserText(category);
    const sanitizedRegion = sanitizeUserText(region || req.user?.location || 'All India');
    const sanitizedOptions = options
      .filter(Boolean)
      .map((text) => sanitizeUserText(text))
      .filter(Boolean);

    if (!sanitizedTitle || !sanitizedDescription || !sanitizedCategory) {
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }

    if (sanitizedOptions.length < 2) {
      return res.status(400).json({ error: 'At least two valid options are required' });
    }

    const poll = await prisma.$transaction(async (tx) => {
      const created = await tx.poll.create({
        data: {
          title: sanitizedTitle,
          description: sanitizedDescription,
          category: sanitizedCategory,
          status: 'active',
          creator: sanitizeUserText(req.user?.name) || 'Community Member',
          region: sanitizedRegion,
          endDate: endDate ? new Date(endDate) : null,
          options: {
            create: sanitizedOptions.map((text) => ({ text })),
          },
        },
        include: { options: true },
    });
    return created;
  });

  await touchDatasetMetadata('community-polls');

  return res.status(201).json({ poll: formatPoll(poll) });
});

router.post('/:id/vote', authenticate, logActivity, async (req, res) => {
  const { id } = req.params;
  const { optionId } = req.body || {};
  if (!optionId) {
    return res.status(400).json({ error: 'Option ID is required' });
  }

  const poll = await prisma.poll.findUnique({
    where: { id },
    include: { options: true },
  });

  if (!poll) {
    return res.status(404).json({ error: 'Poll not found' });
  }

  const option = poll.options.find((item) => item.id === optionId);
  if (!option) {
    return res.status(404).json({ error: 'Option not found' });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.pollVote.create({
        data: {
          pollId: poll.id,
          optionId: option.id,
          userId: req.user.id,
        },
      });

      await tx.pollOption.update({
        where: { id: option.id },
        data: { votes: { increment: 1 } },
      });
    });
  } catch (error) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'You have already voted in this poll.' });
    }
    throw error;
  }

  const updatedPoll = await prisma.poll.findUnique({
    where: { id },
    include: { options: true },
  });

  await touchDatasetMetadata('community-polls');

  return res.json({ poll: formatPoll(updatedPoll) });
});

export default router;

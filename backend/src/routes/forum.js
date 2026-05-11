import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { logActivity } from '../middleware/activity.js';
import prisma from '../config/database.js';
import { logger } from '../utils/logger.js';
import { sanitizeUserText } from '../utils/sanitize.js';

const router = express.Router();

// Get forum posts
router.get('/posts', authenticate, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      isApproved: true,
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.post.count({ where });

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create new post
router.post('/posts', authenticate, logActivity, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    const sanitizedTitle = sanitizeUserText(title);
    const sanitizedContent = sanitizeUserText(content);
    const sanitizedCategory = sanitizeUserText(category);
    const sanitizedTags = Array.isArray(tags)
      ? tags.map((tag) => sanitizeUserText(tag)).filter(Boolean)
      : null;

    if (!sanitizedTitle || !sanitizedContent || !sanitizedCategory) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    const post = await prisma.post.create({
      data: {
        authorId: req.user.id,
        title: sanitizedTitle,
        content: sanitizedContent,
        category: sanitizedCategory,
        tags: sanitizedTags?.length ? JSON.stringify(sanitizedTags) : null,
        isApproved: req.user.role === 'EXPERT' || req.user.role === 'ADMIN'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    res.status(201).json({ post });
  } catch (error) {
    logger.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get single post with comments
router.get('/posts/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    res.json({ post });
  } catch (error) {
    logger.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Add comment to post
router.post('/posts/:id/comments', authenticate, logActivity, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const sanitizedContent = sanitizeUserText(content);
    if (!sanitizedContent) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        postId: id,
        authorId: req.user.id,
        content: sanitizedContent
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    res.status(201).json({ comment });
  } catch (error) {
    logger.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Like/unlike post
router.post('/posts/:id/like', authenticate, logActivity, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // In a real app, you'd track individual likes, but for simplicity, just increment
    await prisma.post.update({
      where: { id },
      data: { likes: { increment: 1 } }
    });

    res.json({ message: 'Post liked' });
  } catch (error) {
    logger.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Get categories
router.get('/categories', authenticate, async (req, res) => {
  try {
    const categories = [
      'crop-management',
      'pest-control',
      'fertilizers',
      'irrigation',
      'market-prices',
      'weather',
      'government-schemes',
      'general-discussion'
    ];

    res.json({ categories });
  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;

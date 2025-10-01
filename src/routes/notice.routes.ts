import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notices
 *   description: Notice management endpoints
 */

// All notice routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/notices:
 *   get:
 *     summary: Get notices
 *     tags: [Notices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notices retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res) => {
  try {
    const { priority, isActive = 'true', page = '1', limit = '50' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {
      isActive: isActive === 'true',
    };
    
    if (priority && typeof priority === 'string') {
      where.priority = priority;
    }
    
    // Filter by notices that haven't expired
    where.OR = [
      { expiryDate: null },
      { expiryDate: { gte: new Date() } },
    ];

    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: [
          { priority: 'desc' },
          { publishDate: 'desc' },
        ],
      }),
      prisma.notice.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: notices,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notices',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Subjects
 *   description: Subject management endpoints
 */

// All subject routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: Get all subjects
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subjects retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authorize('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const { search, page = '1', limit = '50' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (search && typeof search === 'string') {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          code: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
      ];
    }

    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          teachers: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
            },
          },
          classes: true,
          _count: {
            select: {
              teachers: true,
              classes: true,
              exams: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.subject.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: subjects,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

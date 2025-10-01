import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Teachers
 *   description: Teacher management endpoints
 */

// All teacher routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/teachers:
 *   get:
 *     summary: Get all teachers
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Teachers retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authorize('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const { search, subjectId, page = '1', limit = '50' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (subjectId && typeof subjectId === 'string') {
      where.subjects = {
        some: {
          id: subjectId,
        },
      };
    }
    
    if (search && typeof search === 'string') {
      where.OR = [
        {
          user: {
            profile: {
              firstName: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          },
        },
        {
          user: {
            profile: {
              lastName: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          },
        },
        {
          employeeId: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
      ];
    }

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          subjects: {
            include: {
              classes: true,
            },
          },
          _count: {
            select: {
              subjects: true,
              classes: true,
            },
          },
        },
        orderBy: {
          employeeId: 'asc',
        },
      }),
      prisma.teacher.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: teachers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/teachers/{id}:
 *   get:
 *     summary: Get teacher by ID
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: Teacher retrieved successfully
 *       404:
 *         description: Teacher not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authorize('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        subjects: true,
        classes: true,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

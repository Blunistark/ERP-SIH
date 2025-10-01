import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management endpoints
 */

// All student routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authorize('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const { search, classId, page = '1', limit = '50' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (classId && typeof classId === 'string') {
      where.classId = classId;
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
          rollNumber: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
      ];
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          class: true,
          parent: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
        orderBy: {
          rollNumber: 'asc',
        },
      }),
      prisma.student.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Get student by ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student retrieved successfully
 *       404:
 *         description: Student not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authorize('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        class: true,
        parent: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch student',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

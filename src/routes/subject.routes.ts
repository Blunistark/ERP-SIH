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

/**
 * @swagger
 * /api/subjects/{id}:
 *   get:
 *     summary: Get subject by ID
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject retrieved successfully
 *       404:
 *         description: Subject not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authorize('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const subject = await prisma.subject.findUnique({
      where: { id },
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
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
    return;
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subject',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
});

/**
 * @swagger
 * /api/subjects:
 *   post:
 *     summary: Create a new subject
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - credits
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               credits:
 *                 type: integer
 *               teacherIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               classIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Subject created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', authorize('ADMIN'), async (req, res) => {
  try {
    const { name, code, description, credits, teacherIds = [], classIds = [] } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject name is required',
      });
    }
    
    if (!code?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject code is required',
      });
    }

    // Check if subject code already exists
    const existingSubject = await prisma.subject.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject code already exists',
      });
    }

    const subject = await prisma.subject.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description?.trim() || null,
        credits: Number(credits) || 1,
        teachers: {
          connect: teacherIds.map((id: string) => ({ id })),
        },
        classes: {
          connect: classIds.map((id: string) => ({ id })),
        },
      },
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
    });

    res.status(201).json({
      success: true,
      data: subject,
      message: 'Subject created successfully',
    });
    return;
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subject',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
});

/**
 * @swagger
 * /api/subjects/{id}:
 *   put:
 *     summary: Update subject by ID
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               credits:
 *                 type: integer
 *               teacherIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               classIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *       404:
 *         description: Subject not found
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', authorize('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, credits, teacherIds = [], classIds = [] } = req.body;
    
    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({ where: { id } });
    if (!existingSubject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    // Check if code is being changed and if it conflicts with another subject
    if (code && code.trim().toUpperCase() !== existingSubject.code) {
      const codeConflict = await prisma.subject.findUnique({
        where: { code: code.trim().toUpperCase() },
      });
      
      if (codeConflict) {
        return res.status(400).json({
          success: false,
          message: 'Subject code already exists',
        });
      }
    }

    // Update subject with new relationships
    const subject = await prisma.subject.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(code && { code: code.trim().toUpperCase() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(credits !== undefined && { credits: Number(credits) }),
        teachers: {
          set: [], // Clear existing relationships
          connect: teacherIds.map((teacherId: string) => ({ id: teacherId })),
        },
        classes: {
          set: [], // Clear existing relationships
          connect: classIds.map((classId: string) => ({ id: classId })),
        },
      },
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
    });

    res.status(200).json({
      success: true,
      data: subject,
      message: 'Subject updated successfully',
    });
    return;
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subject',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
});

/**
 * @swagger
 * /api/subjects/{id}:
 *   delete:
 *     summary: Delete subject by ID
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *       404:
 *         description: Subject not found
 *       400:
 *         description: Cannot delete subject with existing relationships
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authorize('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            exams: true,
            grades: true,
            timetableSlots: true,
          },
        },
      },
    });
    
    if (!existingSubject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    // Check for existing relationships that would prevent deletion
    const hasExams = existingSubject._count.exams > 0;
    const hasGrades = existingSubject._count.grades > 0;
    const hasTimetableSlots = existingSubject._count.timetableSlots > 0;

    if (hasExams || hasGrades || hasTimetableSlots) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete subject with existing exams, grades, or timetable entries',
        details: {
          exams: hasExams,
          grades: hasGrades,
          timetableSlots: hasTimetableSlots,
        },
      });
    }

    // Delete the subject (relationships with teachers and classes will be automatically removed)
    await prisma.subject.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
    });
    return;
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subject',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
});

export default router;

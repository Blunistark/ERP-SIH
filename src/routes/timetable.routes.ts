import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Timetables
 *   description: Timetable management endpoints
 */

// All timetable routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/timetables:
 *   get:
 *     summary: Get all timetables
 *     tags: [Timetables]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Timetables retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authorize('ADMIN', 'TEACHER', 'STUDENT'), async (req, res) => {
  try {
    const { classId, page = '1', limit = '50' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (classId && typeof classId === 'string') {
      where.classId = classId;
    }

    const [timetables, total] = await Promise.all([
      prisma.timetable.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          slots: {
            include: {
              class: true,
              subject: true,
              teacher: {
                include: {
                  user: {
                    include: {
                      profile: true,
                    },
                  },
                },
              },
            },
            orderBy: [
              { dayOfWeek: 'asc' },
              { startTime: 'asc' },
            ],
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.timetable.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: timetables,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching timetables:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timetables',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/timetables/{id}:
 *   get:
 *     summary: Get a specific timetable by ID
 *     tags: [Timetables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timetable retrieved successfully
 *       404:
 *         description: Timetable not found
 */
router.get('/:id', authorize('ADMIN', 'TEACHER', 'STUDENT'), async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await prisma.timetable.findUnique({
      where: { id },
      include: {
        slots: {
          include: {
            class: true,
            subject: true,
            teacher: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' },
          ],
        },
      },
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: timetable,
    });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch timetable',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/timetables/{id}:
 *   put:
 *     summary: Update a timetable
 *     tags: [Timetables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               classId:
 *                 type: string
 *               slots:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Timetable updated successfully
 *       404:
 *         description: Timetable not found
 */
router.put('/:id', authorize('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, classId, slots } = req.body;

    // Check if timetable exists
    const existingTimetable = await prisma.timetable.findUnique({
      where: { id },
    });

    if (!existingTimetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found',
      });
    }

    // Update timetable in a transaction
    const updatedTimetable = await prisma.$transaction(async (tx) => {
      // Delete existing slots
      await tx.timetableSlot.deleteMany({
        where: { timetableId: id },
      });

      // Update timetable basic info
      const timetable = await tx.timetable.update({
        where: { id },
        data: {
          name,
          classId,
        },
      });

      // Create new slots if provided
      if (slots && Array.isArray(slots)) {
        await tx.timetableSlot.createMany({
          data: slots.map((slot: any) => ({
            timetableId: id,
            classId,
            subjectId: slot.subjectId,
            teacherId: slot.teacherId,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            period: slot.period,
          })),
        });
      }

      // Return updated timetable with slots
      return await tx.timetable.findUnique({
        where: { id },
        include: {
          slots: {
            include: {
              class: true,
              subject: true,
              teacher: {
                include: {
                  user: {
                    include: {
                      profile: true,
                    },
                  },
                },
              },
            },
            orderBy: [
              { dayOfWeek: 'asc' },
              { startTime: 'asc' },
            ],
          },
        },
      });
    });

    return res.status(200).json({
      success: true,
      data: updatedTimetable,
      message: 'Timetable updated successfully',
    });
  } catch (error) {
    console.error('Error updating timetable:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update timetable',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/timetables:
 *   post:
 *     summary: Create a new timetable
 *     tags: [Timetables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               classId:
 *                 type: string
 *               slots:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Timetable created successfully
 */
router.post('/', authorize('ADMIN'), async (req, res) => {
  try {
    const { name, classId, slots } = req.body;

    if (!name || !classId) {
      return res.status(400).json({
        success: false,
        message: 'Name and classId are required',
      });
    }

    // Create timetable in a transaction
    const newTimetable = await prisma.$transaction(async (tx) => {
      // Create timetable
      const timetable = await tx.timetable.create({
        data: {
          name,
          classId,
        },
      });

      // Create slots if provided
      if (slots && Array.isArray(slots)) {
        await tx.timetableSlot.createMany({
          data: slots.map((slot: any) => ({
            timetableId: timetable.id,
            classId,
            subjectId: slot.subjectId,
            teacherId: slot.teacherId,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            period: slot.period,
          })),
        });
      }

      // Return created timetable with slots
      return await tx.timetable.findUnique({
        where: { id: timetable.id },
        include: {
          slots: {
            include: {
              class: true,
              subject: true,
              teacher: {
                include: {
                  user: {
                    include: {
                      profile: true,
                    },
                  },
                },
              },
            },
            orderBy: [
              { dayOfWeek: 'asc' },
              { startTime: 'asc' },
            ],
          },
        },
      });
    });

    return res.status(201).json({
      success: true,
      data: newTimetable,
      message: 'Timetable created successfully',
    });
  } catch (error) {
    console.error('Error creating timetable:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create timetable',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance management endpoints
 */

// All attendance routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/attendance/stats:
 *   get:
 *     summary: Get attendance statistics
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', authorize('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalStudents, todayAttendance] = await Promise.all([
      prisma.student.count(),
      prisma.attendance.findMany({
        where: {
          date: {
            gte: today,
          },
        },
      }),
    ]);

    const presentToday = todayAttendance.filter((a: any) => a.status === 'PRESENT').length;
    const absentToday = todayAttendance.filter((a: any) => a.status === 'ABSENT').length;
    const lateToday = todayAttendance.filter((a: any) => a.status === 'LATE').length;
    const attendanceRate = totalStudents > 0 ? (presentToday / totalStudents) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        presentToday,
        absentToday,
        lateToday,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance statistics',
    });
  }
});

/**
 * @swagger
 * /api/attendance/recent:
 *   get:
 *     summary: Get recent attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent attendance records retrieved successfully
 */
router.get('/recent', authorize('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const recentAttendance = await prisma.attendance.findMany({
      take: 10,
      orderBy: {
        date: 'desc',
      },
      include: {
        student: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            class: true,
          },
        },
      },
    });

    const formattedData = recentAttendance.map((record: any) => ({
      id: record.id,
      studentId: record.studentId,
      studentName: `${record.student.user.profile.firstName} ${record.student.user.profile.lastName}`,
      className: `${record.student.class.name} ${record.student.class.section}`,
      date: record.date.toISOString().split('T')[0],
      status: record.status,
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error('Error fetching recent attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent attendance',
    });
  }
});

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authorize('ADMIN', 'TEACHER', 'PARENT'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Attendance management module - Coming soon',
    data: [],
  });
});

export default router;

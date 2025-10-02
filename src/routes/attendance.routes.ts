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

/**
 * @swagger
 * /api/attendance/reports/class:
 *   get:
 *     summary: Get class attendance reports
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           format: YYYY-MM
 *         description: Month for the report (YYYY-MM format)
 *     responses:
 *       200:
 *         description: Class attendance reports retrieved successfully
 */
router.get('/reports/class', authorize('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const { month } = req.query;
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const classes = await prisma.class.findMany({
      include: {
        students: {
          include: {
            attendances: {
              where: {
                date: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            },
          },
        },
      },
    });

    const reports = classes.map((cls: any) => {
      const totalStudents = cls.students.length;
      const totalAttendanceDays = cls.students.reduce((sum: number, student: any) => sum + student.attendances.length, 0);
      const presentDays = cls.students.reduce((sum: number, student: any) =>
        sum + student.attendances.filter((a: any) => a.status === 'PRESENT').length, 0
      );

      const averageAttendance = totalAttendanceDays > 0 ? (presentDays / totalAttendanceDays) * 100 : 0;

      return {
        classId: cls.id,
        className: cls.name,
        section: cls.section,
        totalStudents,
        averageAttendance: Math.round(averageAttendance * 10) / 10,
        presentDays,
        totalDays: totalAttendanceDays,
      };
    });

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error('Error fetching class attendance reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching class attendance reports',
    });
  }
});

/**
 * @swagger
 * /api/attendance/reports/student:
 *   get:
 *     summary: Get student attendance reports
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           format: YYYY-MM
 *         description: Month for the report (YYYY-MM format)
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         description: Class ID to filter students
 *     responses:
 *       200:
 *         description: Student attendance reports retrieved successfully
 */
router.get('/reports/student', authorize('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const { month, classId } = req.query;
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const whereClause: any = {};
    if (classId) {
      whereClause.classId = classId;
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        class: true,
        attendances: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    const reports = students.map((student: any) => {
      const totalDays = student.attendances.length;
      const presentDays = student.attendances.filter((a: any) => a.status === 'PRESENT').length;
      const absentDays = student.attendances.filter((a: any) => a.status === 'ABSENT').length;
      const lateDays = student.attendances.filter((a: any) => a.status === 'LATE').length;
      const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

      return {
        studentId: student.id,
        studentName: `${student.user.profile.firstName} ${student.user.profile.lastName}`,
        rollNumber: student.rollNumber,
        className: `${student.class.name} ${student.class.section}`,
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendancePercentage: Math.round(attendancePercentage * 10) / 10,
      };
    });

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error('Error fetching student attendance reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student attendance reports',
    });
  }
});

export default router;

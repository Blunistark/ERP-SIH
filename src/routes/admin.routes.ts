import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin dashboard and management endpoints
 */

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN'));

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/stats', async (req, res) => {
  try {
    // Get counts in parallel
    const [totalStudents, totalTeachers, totalClasses, activeAcademicYear] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count(),
      prisma.academicYear.findFirst({
        where: { isCurrent: true },
        select: { id: true },
      }),
    ]);

    // Calculate total revenue (this is a placeholder - implement based on your fee structure)
    const totalRevenue = totalStudents * 1000; // Placeholder calculation

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin statistics',
    });
  }
});

export default router;

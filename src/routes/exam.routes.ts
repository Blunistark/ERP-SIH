import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Exams
 *   description: Exam management endpoints
 */

// All exam routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/exams:
 *   get:
 *     summary: Get exam records
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Exam records retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authorize('ADMIN', 'TEACHER'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Exam management module - Coming soon',
    data: [],
  });
});

export default router;

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: School settings endpoints
 */

// All settings routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get school settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authorize('ADMIN'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Settings management module - Coming soon',
    data: [],
  });
});

export default router;

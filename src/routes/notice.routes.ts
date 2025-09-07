import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notices
 *   description: Notice management endpoints
 */

// All notice routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/notices:
 *   get:
 *     summary: Get notices
 *     tags: [Notices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notices retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Notice management module - Coming soon',
    data: [],
  });
});

export default router;

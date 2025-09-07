import { Router } from 'express';
import {
  createAcademicYear,
  getAcademicYears,
  getAcademicYearById,
  updateAcademicYear,
  deleteAcademicYear,
  toggleAcademicYearStatus,
  getCurrentAcademicYear
} from '../controllers/academicYear.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Academic Years
 *   description: Academic year management endpoints
 */

// All academic year routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/academic-years:
 *   get:
 *     summary: Get all academic years
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for academic year
 *     responses:
 *       200:
 *         description: Academic years retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authorize('ADMIN', 'TEACHER'), getAcademicYears);

/**
 * @swagger
 * /api/academic-years/current:
 *   get:
 *     summary: Get current active academic year
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current academic year retrieved successfully
 *       404:
 *         description: No active academic year found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/current', authorize('ADMIN', 'TEACHER'), getCurrentAcademicYear);

/**
 * @swagger
 * /api/academic-years:
 *   post:
 *     summary: Create a new academic year
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - year
 *               - startDate
 *               - endDate
 *             properties:
 *               year:
 *                 type: string
 *                 example: "2024-2025"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-08-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-31"
 *               isActive:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Academic year created successfully
 *       400:
 *         description: Bad request or academic year already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post('/', authorize('ADMIN'), createAcademicYear);

/**
 * @swagger
 * /api/academic-years/{id}:
 *   get:
 *     summary: Get academic year by ID
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic year ID
 *     responses:
 *       200:
 *         description: Academic year retrieved successfully
 *       404:
 *         description: Academic year not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authorize('ADMIN', 'TEACHER'), getAcademicYearById);

/**
 * @swagger
 * /api/academic-years/{id}:
 *   put:
 *     summary: Update academic year
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic year ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - year
 *               - startDate
 *               - endDate
 *             properties:
 *               year:
 *                 type: string
 *                 example: "2024-2025"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-08-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-31"
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Academic year updated successfully
 *       400:
 *         description: Bad request or academic year already exists
 *       404:
 *         description: Academic year not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authorize('ADMIN'), updateAcademicYear);

/**
 * @swagger
 * /api/academic-years/{id}/toggle-status:
 *   patch:
 *     summary: Toggle academic year active status
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic year ID
 *     responses:
 *       200:
 *         description: Academic year status toggled successfully
 *       404:
 *         description: Academic year not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/toggle-status', authorize('ADMIN'), toggleAcademicYearStatus);

/**
 * @swagger
 * /api/academic-years/{id}:
 *   delete:
 *     summary: Delete academic year
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic year ID
 *     responses:
 *       200:
 *         description: Academic year deleted successfully
 *       400:
 *         description: Cannot delete academic year with associated data
 *       404:
 *         description: Academic year not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authorize('ADMIN'), deleteAcademicYear);

export default router;

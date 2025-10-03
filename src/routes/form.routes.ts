import { Router } from 'express';
import FormController from '../controllers/form.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const formController = new FormController();

/**
 * @swagger
 * /api/forms/create:
 *   post:
 *     summary: Create a new form
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               fields:
 *                 type: array
 *                 items:
 *                   type: object
 *               tableName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Form created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/create', 
  authenticate, 
  authorize('ADMIN', 'TEACHER'), 
  formController.createForm
);

/**
 * @swagger
 * /api/forms/list:
 *   get:
 *     summary: List all forms created by the authenticated user
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of forms
 *       401:
 *         description: Unauthorized
 */
router.get('/list', 
  authenticate, 
  authorize('ADMIN', 'TEACHER'), 
  formController.listForms
);

/**
 * @swagger
 * /api/forms/{formId}:
 *   get:
 *     summary: Get a specific form by ID (public)
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Form details
 *       404:
 *         description: Form not found
 */
router.get('/:formId', formController.getForm);

/**
 * @swagger
 * /api/forms/submit:
 *   post:
 *     summary: Submit a form response (public)
 *     tags: [Forms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               formId:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       201:
 *         description: Form response submitted successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Form not found
 */
router.post('/submit', formController.submitForm);

/**
 * @swagger
 * /api/forms/responses/{formId}:
 *   get:
 *     summary: Get all responses for a specific form
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of form responses
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Form not found
 */
router.get('/responses/:formId', 
  authenticate, 
  authorize('ADMIN', 'TEACHER'), 
  formController.getResponses
);

/**
 * @swagger
 * /api/forms/delete/{formId}:
 *   delete:
 *     summary: Delete a form and all its responses
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Form deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Form not found
 */
router.delete('/delete/:formId', 
  authenticate, 
  authorize('ADMIN', 'TEACHER'), 
  formController.deleteForm
);

export default router;

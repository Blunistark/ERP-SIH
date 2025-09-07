import { Router } from 'express';
import AIController from '../controllers/ai.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const aiController = new AIController();

// Apply authentication to all AI routes
router.use(authenticate);

// General AI service endpoint
router.post('/process', aiController.processAIRequest);

// Get available AI services
router.get('/services', aiController.getServices);

// Analytics endpoints (accessible to teachers and admins)
router.post('/analytics', 
  authorize('TEACHER', 'ADMIN'),
  aiController.getAnalytics
);

// Prediction endpoints (accessible to teachers and admins)
router.post('/predictions', 
  authorize('TEACHER', 'ADMIN'),
  aiController.getPredictions
);

// Automation endpoints (admin only)
router.post('/automation', 
  authorize('ADMIN'), 
  aiController.createAutomation
);

// Content generation endpoints (accessible to teachers and admins)
router.post('/content', 
  authorize('TEACHER', 'ADMIN'), 
  aiController.generateContent
);

// Emergency response endpoints (accessible to all authenticated users)
router.post('/emergency', aiController.handleEmergency);

// Behavioral analysis endpoints (accessible to teachers and admins)
router.post('/behavior', 
  authorize('TEACHER', 'ADMIN'), 
  aiController.analyzeBehavior
);

// Resource optimization endpoints (admin only)
router.post('/resources', 
  authorize('ADMIN'), 
  aiController.optimizeResources
);

export default router;

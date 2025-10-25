import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getProgress,
  getProgressStats,
  addStudySession,
  addGoal,
  updateGoalProgress,
  getInsights,
  getAnalytics
} from '../controllers/progressController.js';

const router = express.Router();

// Progress routes
router.get('/', protect, getProgress);
router.get('/stats', protect, getProgressStats);
router.get('/insights', protect, getInsights);
router.get('/analytics', protect, getAnalytics);
router.post('/sessions', protect, addStudySession);
router.post('/goals', protect, addGoal);
router.put('/goals/:goalId', protect, updateGoalProgress);

export default router;

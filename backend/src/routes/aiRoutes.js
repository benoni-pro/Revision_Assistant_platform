import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Temporary controller functions
const getAIAnalysis = (req, res) => {
  res.json({ message: 'AI Analysis - Coming soon!' });
};

const generateRecommendations = (req, res) => {
  res.json({ message: 'AI Recommendations - Coming soon!' });
};

// Routes
router.get('/analysis', protect, getAIAnalysis);
router.post('/recommendations', protect, generateRecommendations);

export default router;

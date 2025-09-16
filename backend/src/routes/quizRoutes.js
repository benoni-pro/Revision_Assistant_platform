import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Temporary controller functions
const getQuizzes = (req, res) => {
  res.json({ message: 'Get quizzes - Coming soon!' });
};

const createQuiz = (req, res) => {
  res.json({ message: 'Create quiz - Coming soon!' });
};

// Routes
router.get('/', protect, getQuizzes);
router.post('/', protect, createQuiz);

export default router;

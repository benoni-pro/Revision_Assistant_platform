import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Temporary controller functions
const getProgress = (req, res) => {
  res.json({ message: 'Get progress - Coming soon!' });
};

const updateProgress = (req, res) => {
  res.json({ message: 'Update progress - Coming soon!' });
};

// Routes
router.get('/', protect, getProgress);
router.put('/', protect, updateProgress);

export default router;

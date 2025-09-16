import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Temporary controller functions
const getNotifications = (req, res) => {
  res.json({ message: 'Get notifications - Coming soon!' });
};

const markAsRead = (req, res) => {
  res.json({ message: 'Mark notification as read - Coming soon!' });
};

// Routes
router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);

export default router;

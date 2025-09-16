import express from 'express';
import { protect, requireStudyGroupMembership } from '../middleware/authMiddleware.js';

const router = express.Router();

// Temporary controller functions - will implement full controllers later
const getStudyGroups = (req, res) => {
  res.json({ message: 'Get study groups - Coming soon!' });
};

const createStudyGroup = (req, res) => {
  res.json({ message: 'Create study group - Coming soon!' });
};

// Routes
router.get('/', protect, getStudyGroups);
router.post('/', protect, createStudyGroup);

export default router;

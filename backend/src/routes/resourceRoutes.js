import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Temporary controller functions
const getResources = (req, res) => {
  res.json({ message: 'Get resources - Coming soon!' });
};

const uploadResource = (req, res) => {
  res.json({ message: 'Upload resource - Coming soon!' });
};

// Routes
router.get('/', protect, getResources);
router.post('/', protect, uploadResource);

export default router;

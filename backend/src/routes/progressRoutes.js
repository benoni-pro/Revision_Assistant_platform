import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Progress from '../models/Progress.js';

const router = express.Router();

// Get current user's progress summary
const getProgress = async (req, res) => {
  try {
    let progress = await Progress.findOne({ user: req.user._id });
    if (!progress) {
      progress = await Progress.create({ user: req.user._id, studySessions: [] });
    }
    res.json({
      success: true,
      message: 'Progress fetched',
      data: {
        totalStudyTime: progress.totalStudyTime,
        streak: { current: progress.streaks?.current?.days || 0, longest: progress.streaks?.longest?.days || 0 },
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch progress' });
  }
};

// Update progress (e.g., add study session)
const updateProgress = async (req, res) => {
  try {
    const { studySession } = req.body;
    let progress = await Progress.findOne({ user: req.user._id });
    if (!progress) {
      progress = await Progress.create({ user: req.user._id, studySessions: [] });
    }
    if (studySession) {
      progress.studySessions.push(studySession);
      await progress.save();
    }
    res.json({ success: true, message: 'Progress updated', data: { totalStudyTime: progress.totalStudyTime } });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Failed to update progress' });
  }
};

// Routes
router.get('/', protect, getProgress);
router.put('/', protect, updateProgress);

export default router;

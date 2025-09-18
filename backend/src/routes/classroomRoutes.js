import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import Classroom from '../models/Classroom.js';
import Assignment from '../models/Assignment.js';

const router = express.Router();

// Classrooms
router.get('/', protect, authorize('teacher','manager','admin'), async (req, res) => {
  const classes = await Classroom.find({ teacher: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, message: 'Classrooms', data: { docs: classes } });
});

router.post('/', protect, authorize('teacher','manager','admin'), async (req, res) => {
  const cls = await Classroom.create({ ...req.body, teacher: req.user._id });
  res.status(201).json({ success: true, message: 'Classroom created', data: cls });
});

router.put('/:id', protect, authorize('teacher','manager','admin'), async (req, res) => {
  const cls = await Classroom.findOneAndUpdate({ _id: req.params.id, teacher: req.user._id }, req.body, { new: true });
  if (!cls) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, message: 'Updated', data: cls });
});

router.delete('/:id', protect, authorize('teacher','manager','admin'), async (req, res) => {
  await Classroom.deleteOne({ _id: req.params.id, teacher: req.user._id });
  res.json({ success: true, message: 'Deleted' });
});

// Assignments
router.get('/:id/assignments', protect, authorize('teacher','manager','admin'), async (req, res) => {
  const list = await Assignment.find({ classroom: req.params.id }).sort({ createdAt: -1 });
  res.json({ success: true, message: 'Assignments', data: { docs: list } });
});

router.post('/:id/assignments', protect, authorize('teacher','manager','admin'), async (req, res) => {
  const asg = await Assignment.create({ ...req.body, classroom: req.params.id, createdBy: req.user._id });
  res.status(201).json({ success: true, message: 'Assignment created', data: asg });
});

export default router;


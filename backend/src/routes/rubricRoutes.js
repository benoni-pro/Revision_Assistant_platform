import express from 'express';
import { body } from 'express-validator';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import Rubric from '../models/Rubric.js';

const router = express.Router();

const rubricValidation = [
  body('title').isLength({ min: 2 }).withMessage('Title is required'),
  body('genre').optional().isIn(['argumentative','narrative','informative','other']),
  body('criteria').isArray({ min: 1 }).withMessage('At least one criterion is required')
];

// List (public or mine)
router.get('/', protect, async (req, res) => {
  const { genre } = req.query;
  const q = { $or: [{ isPublic: true }, { createdBy: req.user._id }] };
  if (genre) q.genre = genre;
  const rubrics = await Rubric.find(q).sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, message: 'Rubrics', data: { docs: rubrics } });
});

// Create (teacher/admin)
router.post('/', protect, authorize('teacher','manager','admin'), rubricValidation, validate, async (req, res) => {
  const rubric = await Rubric.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, message: 'Rubric created', data: rubric });
});

// Update (owner or admin)
router.put('/:id', protect, authorize('teacher','manager','admin'), rubricValidation, validate, async (req, res) => {
  const rub = await Rubric.findById(req.params.id);
  if (!rub) return res.status(404).json({ success: false, message: 'Not found' });
  if (rub.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  Object.assign(rub, req.body);
  await rub.save();
  res.json({ success: true, message: 'Rubric updated', data: rub });
});

// Delete (owner or admin)
router.delete('/:id', protect, authorize('teacher','manager','admin'), async (req, res) => {
  const rub = await Rubric.findById(req.params.id);
  if (!rub) return res.status(404).json({ success: false, message: 'Not found' });
  if (rub.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  await rub.deleteOne();
  res.json({ success: true, message: 'Rubric deleted' });
});

export default router;


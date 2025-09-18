import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import StudyGroup from '../models/StudyGroup.js';

const router = express.Router();

// List study groups for current user (creator or member)
const getStudyGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await StudyGroup.find({
      $or: [
        { creator: userId },
        { 'members.user': userId }
      ],
      isActive: true
    })
      .sort({ createdAt: -1 })
      .select('name subject level members creator createdAt');

    const docs = groups.map(g => ({
      _id: g._id,
      name: g.name,
      subject: g.subject,
      level: g.level,
      memberCount: g.members?.filter(m => m.isActive).length || 0,
    }));

    res.json({ success: true, message: 'Study groups fetched', data: { docs, totalDocs: docs.length } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch study groups' });
  }
};

// Create a study group and add current user as creator and member
const createStudyGroup = async (req, res) => {
  try {
    const { name, subject, level, description } = req.body;
    const group = await StudyGroup.create({
      name,
      subject,
      level,
      description: description || `${subject} ${level} group`,
      creator: req.user._id,
      members: [{ user: req.user._id, role: 'admin', isActive: true }]
    });

    res.status(201).json({
      success: true,
      message: 'Study group created',
      data: {
        _id: group._id,
        name: group.name,
        subject: group.subject,
        level: group.level,
        memberCount: 1,
      }
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message || 'Failed to create group' });
  }
};

// Routes
router.get('/', protect, getStudyGroups);
router.post('/', protect, createStudyGroup);

// Get a single group with members (requires membership)
router.get('/:id', protect, async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .select('name subject level members creator');
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    const uid = req.user._id.toString();
    const isMember = group.creator.toString() === uid || group.members.some(m => m.user.toString() === uid && m.isActive);
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a member of this group' });
    const members = await StudyGroup.aggregate([
      { $match: { _id: group._id } },
      { $unwind: '$members' },
      { $match: { 'members.isActive': true } },
      { $lookup: { from: 'users', localField: 'members.user', foreignField: '_id', as: 'u' } },
      { $unwind: '$u' },
      { $project: { _id: 0, id: '$u._id', firstName: '$u.firstName', lastName: '$u.lastName', avatar: '$u.avatar', role: '$members.role' } }
    ]);
    res.json({ success: true, message: 'Group fetched', data: { _id: group._id, name: group.name, subject: group.subject, level: group.level, members } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch group' });
  }
});

export default router;

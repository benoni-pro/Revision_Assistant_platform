import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Quiz from '../models/Quiz.js';

const router = express.Router();

// Get list of quizzes (created by the user or public)
const getQuizzes = async (req, res) => {
  try {
    const userId = req.user._id;
    const quizzes = await Quiz.find({
      $or: [
        { createdBy: userId },
        { isPublic: true }
      ],
      isActive: true
    })
      .sort({ createdAt: -1 })
      .select('title subject level totalQuestions');

    const docs = quizzes.map(q => ({
      _id: q._id,
      title: q.title,
      subject: q.subject,
      level: q.level,
      totalQuestions: q.totalQuestions,
    }));

    res.json({ success: true, message: 'Quizzes fetched', data: { docs, totalDocs: docs.length } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes' });
  }
};

// Create a basic quiz shell
const createQuiz = async (req, res) => {
  try {
    const { title, subject, level, description } = req.body;
    const quiz = await Quiz.create({
      title,
      subject,
      level,
      description,
      createdBy: req.user._id,
      questions: [],
      totalQuestions: 0,
      totalPoints: 0,
      isPublic: false,
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created',
      data: {
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        level: quiz.level,
        totalQuestions: 0,
      }
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message || 'Failed to create quiz' });
  }
};

// Routes
router.get('/', protect, getQuizzes);
router.post('/', protect, createQuiz);

export default router;

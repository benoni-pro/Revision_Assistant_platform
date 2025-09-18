import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Quiz from '../models/Quiz.js';
import Progress from '../models/Progress.js';

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
router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('-ratings -statistics');
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    // Send questions, optionally shuffled
    const shuffled = quiz.getShuffledQuestions();
    const includeReview = req.query.review === '1' || req.query.review === 'true';
    res.json({ success: true, message: 'Quiz fetched', data: {
      _id: quiz._id,
      title: quiz.title,
      subject: quiz.subject,
      level: quiz.level,
      settings: quiz.settings,
      totalQuestions: quiz.totalQuestions,
      questions: shuffled.map(q => ({
        _id: q._id,
        type: q.type,
        question: q.question,
        options: q.options?.map(o => includeReview ? { text: o.text, isCorrect: o.isCorrect } : { text: o.text }),
        points: q.points,
        explanation: includeReview ? q.explanation : undefined,
      }))
    }});
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch quiz' });
  }
});

// Submit attempt
router.post('/:id/attempts', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const { answers, timeSpent = 0 } = req.body;
    const result = quiz.calculateScore(answers || {});
    quiz.updateStatistics(result);
    await quiz.save();

    // Persist to user progress
    let progress = await Progress.findOne({ user: req.user._id });
    if (!progress) progress = await Progress.create({ user: req.user._id, studySessions: [] });
    progress.assessmentResults.push({
      quiz: quiz._id,
      score: result.percentage,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      timeSpent: Math.ceil(timeSpent / 60),
      passed: result.passed,
    });
    await progress.save();

    res.status(201).json({ success: true, message: 'Attempt submitted', data: result });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Failed to submit attempt' });
  }
});

export default router;

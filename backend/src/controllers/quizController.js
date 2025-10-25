import Quiz from '../models/Quiz.js';
import Progress from '../models/Progress.js';
import User from '../models/User.js';

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Private
export const getQuizzes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      subject,
      level,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {
      $or: [
        { createdBy: req.user._id },
        { isPublic: true, status: 'published' }
      ],
      isActive: true
    };

    if (subject) query.subject = subject;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };

    const quizzes = await Quiz.find(query)
      .select('title subject level description totalQuestions totalPoints averageRating statistics category tags createdAt createdBy')
      .populate('createdBy', 'firstName lastName avatar')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Quiz.countDocuments(query);

    res.json({
      success: true,
      data: {
        docs: quizzes,
        totalDocs: total,
        limit: parseInt(limit),
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes'
    });
  }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Private
export const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'firstName lastName avatar');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user has access
    const hasAccess = quiz.isPublic || 
                      quiz.createdBy._id.toString() === req.user._id.toString() ||
                      req.user.role === 'teacher' || 
                      req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get shuffled questions if enabled
    const questions = quiz.settings.shuffleQuestions ? 
      quiz.getShuffledQuestions() : 
      quiz.questions;

    // Remove correct answers unless in review mode
    const includeAnswers = req.query.review === 'true';
    const sanitizedQuestions = questions.map(q => ({
      _id: q._id,
      type: q.type,
      question: q.question,
      options: q.options?.map(o => ({
        text: o.text,
        ...(includeAnswers && { isCorrect: o.isCorrect })
      })),
      points: q.points,
      difficulty: q.difficulty,
      tags: q.tags,
      ...(includeAnswers && { explanation: q.explanation }),
      ...(includeAnswers && { correctAnswers: q.correctAnswers })
    }));

    res.json({
      success: true,
      data: {
        ...quiz.toObject(),
        questions: sanitizedQuestions
      }
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz'
    });
  }
};

// @desc    Create quiz
// @route   POST /api/quizzes
// @access  Private (Teacher/Admin)
export const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      topic,
      level,
      questions,
      settings,
      isPublic,
      category,
      tags
    } = req.body;

    const quiz = await Quiz.create({
      title,
      description,
      subject,
      topic,
      level: level || 'intermediate',
      questions: questions || [],
      settings: settings || {},
      isPublic: isPublic || false,
      category: category || 'practice',
      tags: tags || [],
      createdBy: req.user._id,
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create quiz'
    });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Owner/Teacher/Admin)
export const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user is owner or has appropriate role
    const canEdit = quiz.createdBy.toString() === req.user._id.toString() ||
                    req.user.role === 'teacher' ||
                    req.user.role === 'admin';

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this quiz'
      });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: updatedQuiz
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update quiz'
    });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Owner/Admin)
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const canDelete = quiz.createdBy.toString() === req.user._id.toString() ||
                      req.user.role === 'admin';

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this quiz'
      });
    }

    // Soft delete
    quiz.isActive = false;
    quiz.status = 'archived';
    await quiz.save();

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz'
    });
  }
};

// @desc    Submit quiz attempt
// @route   POST /api/quizzes/:id/attempts
// @access  Private
export const submitQuizAttempt = async (req, res) => {
  try {
    const { answers, timeSpent } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Calculate score
    const result = quiz.calculateScore(answers);

    // Update quiz statistics
    quiz.updateStatistics(result);
    await quiz.save();

    // Update user progress
    let progress = await Progress.findOne({ user: req.user._id });
    if (!progress) {
      progress = await Progress.create({ user: req.user._id });
    }

    await progress.addAssessmentResult({
      quiz: quiz._id,
      score: result.percentage,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      timeSpent: Math.ceil(timeSpent / 60) || 0,
      passed: result.passed
    });

    // Update user statistics
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'statistics.completedQuizzes': 1 }
    });

    // Calculate average quiz score
    const userProgress = await Progress.findOne({ user: req.user._id });
    if (userProgress && userProgress.assessmentResults.length > 0) {
      const avgScore = userProgress.overallAverage;
      await User.findByIdAndUpdate(req.user._id, {
        'statistics.averageQuizScore': avgScore
      });
    }

    res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        ...result,
        feedback: generateFeedback(result)
      }
    });
  } catch (error) {
    console.error('Submit quiz attempt error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to submit quiz'
    });
  }
};

// @desc    Get quiz attempts for user
// @route   GET /api/quizzes/:id/attempts
// @access  Private
export const getQuizAttempts = async (req, res) => {
  try {
    const progress = await Progress.findOne({ user: req.user._id })
      .populate('assessmentResults.quiz', 'title subject');

    if (!progress) {
      return res.json({
        success: true,
        data: []
      });
    }

    const quizAttempts = progress.assessmentResults.filter(
      result => result.quiz._id.toString() === req.params.id
    );

    res.json({
      success: true,
      data: quizAttempts
    });
  } catch (error) {
    console.error('Get quiz attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz attempts'
    });
  }
};

// @desc    Publish quiz
// @route   PATCH /api/quizzes/:id/publish
// @access  Private (Owner/Teacher/Admin)
export const publishQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const canPublish = quiz.createdBy.toString() === req.user._id.toString() ||
                       req.user.role === 'teacher' ||
                       req.user.role === 'admin';

    if (!canPublish) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to publish this quiz'
      });
    }

    if (quiz.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot publish quiz without questions'
      });
    }

    quiz.status = 'published';
    await quiz.save();

    res.json({
      success: true,
      message: 'Quiz published successfully',
      data: quiz
    });
  } catch (error) {
    console.error('Publish quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish quiz'
    });
  }
};

// Helper function to generate feedback
function generateFeedback(result) {
  const percentage = result.percentage;
  
  if (percentage >= 90) {
    return {
      message: 'Excellent work! You have mastered this material.',
      level: 'excellent',
      suggestions: ['Consider taking more advanced quizzes', 'Help others by joining study groups']
    };
  } else if (percentage >= 75) {
    return {
      message: 'Great job! You have a solid understanding.',
      level: 'good',
      suggestions: ['Review the questions you missed', 'Practice similar topics to strengthen your knowledge']
    };
  } else if (percentage >= 60) {
    return {
      message: 'Good effort! There\'s room for improvement.',
      level: 'pass',
      suggestions: ['Review the material again', 'Focus on areas where you struggled', 'Consider joining a study group']
    };
  } else {
    return {
      message: 'Keep trying! More practice will help.',
      level: 'needs_improvement',
      suggestions: [
        'Review the fundamental concepts',
        'Take your time with each question',
        'Consider seeking help from a tutor or study group',
        'Break down the material into smaller sections'
      ]
    };
  }
}

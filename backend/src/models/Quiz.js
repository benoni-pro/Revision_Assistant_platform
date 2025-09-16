import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'short_answer', 'essay', 'matching', 'fill_blank'],
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  explanation: String,
  points: {
    type: Number,
    default: 1,
    min: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [String],
  
  // Multiple Choice / True-False specific
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  
  // Short Answer / Essay specific
  correctAnswers: [String],
  keywords: [String],
  
  // Matching specific
  pairs: [{
    left: String,
    right: String
  }],
  
  // Fill in the blank specific
  blanks: [{
    position: Number,
    correctAnswers: [String],
    caseSensitive: {
      type: Boolean,
      default: false
    }
  }],
  
  // Media attachments
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'audio', 'video', 'document']
    },
    url: String,
    public_id: String,
    description: String
  }]
});

const quizSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  topic: String,
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  
  // Creator and Ownership
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studyGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // Questions
  questions: [questionSchema],
  totalQuestions: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  
  // Quiz Settings
  settings: {
    timeLimit: {
      type: Number, // in minutes
      min: 0
    },
    attempts: {
      type: Number,
      default: 1,
      min: 1,
      max: 10
    },
    shuffleQuestions: {
      type: Boolean,
      default: false
    },
    shuffleOptions: {
      type: Boolean,
      default: false
    },
    showCorrectAnswers: {
      type: String,
      enum: ['immediately', 'after_submission', 'never'],
      default: 'after_submission'
    },
    allowReview: {
      type: Boolean,
      default: true
    },
    passingScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 70
    },
    requirePassword: {
      type: Boolean,
      default: false
    },
    password: String,
    availableFrom: Date,
    availableUntil: Date,
    showScoreDuringQuiz: {
      type: Boolean,
      default: false
    }
  },
  
  // AI-Generated Content
  aiGenerated: {
    isAIGenerated: {
      type: Boolean,
      default: false
    },
    generatedFrom: String, // source content
    adaptedFor: {
      learningStyle: String,
      difficulty: String,
      focus_areas: [String]
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  
  // Analytics and Statistics
  statistics: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    averageTimeSpent: {
      type: Number,
      default: 0 // in minutes
    },
    passRate: {
      type: Number,
      default: 0
    },
    questionStats: [{
      questionId: mongoose.Schema.Types.ObjectId,
      correctAttempts: Number,
      totalAttempts: Number,
      averageTimeSpent: Number,
      difficultyRating: Number
    }],
    commonMistakes: [{
      questionId: mongoose.Schema.Types.ObjectId,
      incorrectAnswer: String,
      frequency: Number
    }]
  },
  
  // Feedback and Ratings
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    difficulty: {
      type: String,
      enum: ['too_easy', 'just_right', 'too_hard']
    },
    ratedAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  
  // Status and Visibility
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'under_review'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Tags and Categories
  tags: [String],
  category: {
    type: String,
    enum: [
      'practice',
      'assessment',
      'mock_exam',
      'quick_review',
      'comprehensive',
      'adaptive'
    ],
    default: 'practice'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
quizSchema.index({ subject: 1, level: 1 });
quizSchema.index({ createdBy: 1 });
quizSchema.index({ studyGroup: 1 });
quizSchema.index({ isPublic: 1, status: 1 });
quizSchema.index({ tags: 1 });
quizSchema.index({ createdAt: -1 });
quizSchema.index({ 'averageRating': -1 });

// Virtual for duration estimate
quizSchema.virtual('estimatedDuration').get(function() {
  if (this.settings.timeLimit) return this.settings.timeLimit;
  
  // Estimate based on question types and count
  let estimate = 0;
  this.questions.forEach(q => {
    switch (q.type) {
      case 'multiple_choice':
      case 'true_false':
        estimate += 1.5; // minutes per question
        break;
      case 'short_answer':
        estimate += 3;
        break;
      case 'essay':
        estimate += 10;
        break;
      case 'matching':
      case 'fill_blank':
        estimate += 2;
        break;
      default:
        estimate += 2;
    }
  });
  
  return Math.ceil(estimate);
});

// Virtual for pass rate percentage
quizSchema.virtual('passRatePercentage').get(function() {
  return this.statistics.totalAttempts > 0 
    ? Math.round((this.statistics.passRate / this.statistics.totalAttempts) * 100)
    : 0;
});

// Pre-save middleware to calculate totals
quizSchema.pre('save', function(next) {
  if (this.isModified('questions')) {
    this.totalQuestions = this.questions.length;
    this.totalPoints = this.questions.reduce((total, q) => total + q.points, 0);
  }
  
  // Calculate average rating
  if (this.ratings && this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = totalRating / this.ratings.length;
  }
  
  next();
});

// Method to add question
quizSchema.methods.addQuestion = function(questionData) {
  this.questions.push(questionData);
  this.totalQuestions = this.questions.length;
  this.totalPoints = this.questions.reduce((total, q) => total + q.points, 0);
  return this;
};

// Method to remove question
quizSchema.methods.removeQuestion = function(questionId) {
  this.questions = this.questions.filter(q => q._id.toString() !== questionId.toString());
  this.totalQuestions = this.questions.length;
  this.totalPoints = this.questions.reduce((total, q) => total + q.points, 0);
  return this;
};

// Method to shuffle questions
quizSchema.methods.getShuffledQuestions = function() {
  if (!this.settings.shuffleQuestions) return this.questions;
  
  const shuffled = [...this.questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.map(question => {
    if (this.settings.shuffleOptions && question.options && question.options.length > 0) {
      const shuffledOptions = [...question.options];
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }
      return { ...question.toObject(), options: shuffledOptions };
    }
    return question;
  });
};

// Method to calculate score
quizSchema.methods.calculateScore = function(answers) {
  let totalScore = 0;
  let correctAnswers = 0;
  const results = [];
  
  this.questions.forEach((question, index) => {
    const userAnswer = answers[question._id.toString()] || answers[index];
    let isCorrect = false;
    let earnedPoints = 0;
    
    switch (question.type) {
      case 'multiple_choice':
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = userAnswer === correctOption?.text;
        break;
        
      case 'true_false':
        const correctTF = question.options.find(opt => opt.isCorrect);
        isCorrect = userAnswer === correctTF?.text;
        break;
        
      case 'short_answer':
        isCorrect = question.correctAnswers.some(answer => 
          answer.toLowerCase().trim() === userAnswer?.toLowerCase().trim()
        );
        break;
        
      case 'fill_blank':
        // Check each blank
        isCorrect = question.blanks.every(blank => {
          const userBlankAnswer = userAnswer?.[blank.position];
          if (!userBlankAnswer) return false;
          
          return blank.correctAnswers.some(correct => {
            if (blank.caseSensitive) {
              return correct === userBlankAnswer;
            }
            return correct.toLowerCase() === userBlankAnswer.toLowerCase();
          });
        });
        break;
        
      case 'matching':
        // Check if all pairs are correctly matched
        isCorrect = question.pairs.every(pair => {
          return userAnswer?.[pair.left] === pair.right;
        });
        break;
        
      default:
        // For essay questions, manual grading required
        isCorrect = false;
    }
    
    if (isCorrect) {
      earnedPoints = question.points;
      correctAnswers++;
    }
    
    totalScore += earnedPoints;
    
    results.push({
      questionId: question._id,
      userAnswer,
      isCorrect,
      earnedPoints,
      maxPoints: question.points
    });
  });
  
  const percentage = this.totalPoints > 0 ? (totalScore / this.totalPoints) * 100 : 0;
  const passed = percentage >= this.settings.passingScore;
  
  return {
    totalScore,
    maxScore: this.totalPoints,
    percentage: Math.round(percentage * 100) / 100,
    correctAnswers,
    totalQuestions: this.questions.length,
    passed,
    results
  };
};

// Method to update statistics
quizSchema.methods.updateStatistics = function(attemptResult) {
  this.statistics.totalAttempts += 1;
  
  // Update average score
  const totalScore = (this.statistics.averageScore * (this.statistics.totalAttempts - 1)) + attemptResult.percentage;
  this.statistics.averageScore = totalScore / this.statistics.totalAttempts;
  
  // Update pass rate
  if (attemptResult.passed) {
    this.statistics.passRate += 1;
  }
  
  // Update question statistics
  attemptResult.results.forEach(result => {
    let questionStat = this.statistics.questionStats.find(
      stat => stat.questionId.toString() === result.questionId.toString()
    );
    
    if (!questionStat) {
      questionStat = {
        questionId: result.questionId,
        correctAttempts: 0,
        totalAttempts: 0,
        averageTimeSpent: 0
      };
      this.statistics.questionStats.push(questionStat);
    }
    
    questionStat.totalAttempts += 1;
    if (result.isCorrect) {
      questionStat.correctAttempts += 1;
    }
  });
  
  return this;
};

export default mongoose.model('Quiz', quizSchema);

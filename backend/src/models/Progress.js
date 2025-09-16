import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  duration: {
    type: Number, // in minutes
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  topic: String,
  activityType: {
    type: String,
    enum: ['reading', 'quiz', 'video', 'practice', 'discussion', 'review', 'research'],
    required: true
  },
  resources: [{
    type: String,
    description: String
  }],
  notes: String,
  mood: {
    type: String,
    enum: ['very_poor', 'poor', 'neutral', 'good', 'excellent']
  },
  focusLevel: {
    type: Number,
    min: 1,
    max: 10
  },
  difficultyLevel: {
    type: String,
    enum: ['very_easy', 'easy', 'moderate', 'hard', 'very_hard']
  },
  productivity: {
    type: Number,
    min: 1,
    max: 10
  },
  environment: {
    location: String,
    noiseLevel: {
      type: String,
      enum: ['silent', 'quiet', 'moderate', 'noisy']
    },
    companions: {
      type: String,
      enum: ['alone', 'with_friends', 'in_group', 'with_tutor']
    }
  }
});

const assessmentResultSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number, // in minutes
    required: true
  },
  attemptNumber: {
    type: Number,
    default: 1
  },
  passed: {
    type: Boolean,
    required: true
  },
  categoryScores: [{
    category: String,
    score: Number,
    maxScore: Number
  }],
  weakAreas: [String],
  strongAreas: [String],
  improvement: {
    type: Number, // percentage improvement from last attempt
    default: 0
  }
});

const goalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    required: true
  },
  category: {
    type: String,
    enum: ['study_time', 'quiz_score', 'skill_mastery', 'streak', 'completion'],
    required: true
  },
  target: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['minutes', 'hours', 'percentage', 'count', 'days'],
      required: true
    }
  },
  currentProgress: {
    type: Number,
    default: 0
  },
  deadline: Date,
  subject: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'failed'],
    default: 'active'
  },
  completedAt: Date,
  rewards: [{
    type: String,
    description: String,
    earnedAt: Date
  }]
});

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Study Sessions Tracking
  studySessions: [studySessionSchema],
  totalStudyTime: {
    type: Number,
    default: 0 // in minutes
  },
  
  // Academic Performance
  assessmentResults: [assessmentResultSchema],
  overallAverage: {
    type: Number,
    default: 0
  },
  subjectAverages: [{
    subject: String,
    average: Number,
    improvement: Number, // percentage change
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Goals and Milestones
  goals: [goalSchema],
  achievements: [{
    title: String,
    description: String,
    icon: String,
    category: {
      type: String,
      enum: ['study_time', 'consistency', 'improvement', 'collaboration', 'mastery']
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    points: {
      type: Number,
      default: 0
    }
  }],
  
  // Streak Information
  streaks: {
    current: {
      days: { type: Number, default: 0 },
      startDate: Date,
      lastStudyDate: Date
    },
    longest: {
      days: { type: Number, default: 0 },
      startDate: Date,
      endDate: Date
    },
    weekly: {
      current: { type: Number, default: 0 },
      target: { type: Number, default: 5 }
    }
  },
  
  // Skill Development
  skillLevels: [{
    subject: {
      type: String,
      required: true
    },
    level: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    experience: {
      type: Number,
      default: 0
    },
    masteredTopics: [String],
    weakTopics: [String],
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    trend: {
      type: String,
      enum: ['improving', 'stable', 'declining'],
      default: 'stable'
    }
  }],
  
  // Learning Analytics
  analytics: {
    // Time-based patterns
    studyPatterns: {
      preferredHours: [{
        hour: Number,
        frequency: Number
      }],
      preferredDays: [{
        day: Number, // 0-6 (Sunday-Saturday)
        averageTime: Number
      }],
      sessionDuration: {
        average: Number,
        preferred: Number,
        optimal: Number
      }
    },
    
    // Performance patterns
    performancePatterns: {
      bestTimeOfDay: String,
      bestDayOfWeek: String,
      optimalSessionLength: Number,
      concentrationPeaks: [Number] // hours of day
    },
    
    // Learning effectiveness
    effectiveness: {
      retentionRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      improvementRate: {
        type: Number,
        default: 0
      },
      consistencyScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      }
    },
    
    // Predictive insights
    insights: [{
      type: {
        type: String,
        enum: ['strength', 'weakness', 'opportunity', 'risk', 'recommendation']
      },
      message: String,
      confidence: {
        type: Number,
        min: 0,
        max: 1
      },
      actionable: Boolean,
      generatedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Collaboration Progress
  collaboration: {
    studyGroupsJoined: {
      type: Number,
      default: 0
    },
    studySessionsHosted: {
      type: Number,
      default: 0
    },
    helpfulVotes: {
      type: Number,
      default: 0
    },
    resourcesShared: {
      type: Number,
      default: 0
    },
    mentoringHours: {
      type: Number,
      default: 0
    }
  },
  
  // Revision Schedule
  revisionSchedule: {
    nextRevisions: [{
      topic: String,
      subject: String,
      scheduledFor: Date,
      difficulty: String,
      importance: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      lastReviewed: Date,
      reviewCount: {
        type: Number,
        default: 0
      }
    }],
    preferences: {
      spacingInterval: {
        type: String,
        enum: ['conservative', 'moderate', 'aggressive'],
        default: 'moderate'
      },
      dailyRevisionTime: {
        type: Number, // minutes
        default: 30
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
// Note: user field already has unique:true which creates an index
progressSchema.index({ 'studySessions.startTime': -1 });
progressSchema.index({ 'assessmentResults.quiz': 1 });
progressSchema.index({ 'goals.status': 1 });
progressSchema.index({ 'skillLevels.subject': 1 });

// Virtual for current week study time
progressSchema.virtual('weeklyStudyTime').get(function() {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  return this.studySessions
    .filter(session => session.startTime >= startOfWeek)
    .reduce((total, session) => total + session.duration, 0);
});

// Virtual for current month study time
progressSchema.virtual('monthlyStudyTime').get(function() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  return this.studySessions
    .filter(session => session.startTime >= startOfMonth)
    .reduce((total, session) => total + session.duration, 0);
});

// Virtual for current grade/level
progressSchema.virtual('currentLevel').get(function() {
  const totalExperience = this.skillLevels.reduce((total, skill) => total + skill.experience, 0);
  return Math.floor(totalExperience / 1000) + 1; // 1000 XP per level
});

// Pre-save middleware
progressSchema.pre('save', function(next) {
  // Update total study time
  if (this.isModified('studySessions')) {
    this.totalStudyTime = this.studySessions.reduce((total, session) => total + session.duration, 0);
  }
  
  // Update overall average
  if (this.isModified('assessmentResults') && this.assessmentResults.length > 0) {
    const totalScore = this.assessmentResults.reduce((sum, result) => sum + result.score, 0);
    this.overallAverage = totalScore / this.assessmentResults.length;
  }
  
  // Update streak information
  if (this.isModified('studySessions')) {
    this.updateStreaks();
  }
  
  next();
});

// Method to add study session
progressSchema.methods.addStudySession = function(sessionData) {
  this.studySessions.push(sessionData);
  this.updateStreaks();
  return this.save();
};

// Method to update streaks
progressSchema.methods.updateStreaks = function() {
  if (this.studySessions.length === 0) return;
  
  // Sort sessions by date
  const sortedSessions = this.studySessions.sort((a, b) => a.startTime - b.startTime);
  const lastSession = sortedSessions[sortedSessions.length - 1];
  
  const today = new Date().toDateString();
  const lastStudyDate = lastSession.startTime.toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Update current streak
  if (lastStudyDate === today || lastStudyDate === yesterday.toDateString()) {
    if (this.streaks.current.lastStudyDate?.toDateString() !== lastStudyDate) {
      this.streaks.current.days += 1;
      this.streaks.current.lastStudyDate = lastSession.startTime;
      
      if (!this.streaks.current.startDate) {
        this.streaks.current.startDate = lastSession.startTime;
      }
      
      // Update longest streak if current is longer
      if (this.streaks.current.days > this.streaks.longest.days) {
        this.streaks.longest = {
          days: this.streaks.current.days,
          startDate: this.streaks.current.startDate,
          endDate: lastSession.startTime
        };
      }
    }
  } else {
    // Reset current streak if more than a day gap
    this.streaks.current = {
      days: 1,
      startDate: lastSession.startTime,
      lastStudyDate: lastSession.startTime
    };
  }
};

// Method to add assessment result
progressSchema.methods.addAssessmentResult = function(resultData) {
  this.assessmentResults.push(resultData);
  
  // Update subject averages
  const subjectResults = this.assessmentResults.filter(r => r.quiz.subject === resultData.quiz.subject);
  const subjectAverage = subjectResults.reduce((sum, r) => sum + r.score, 0) / subjectResults.length;
  
  let subjectRecord = this.subjectAverages.find(s => s.subject === resultData.quiz.subject);
  if (!subjectRecord) {
    subjectRecord = {
      subject: resultData.quiz.subject,
      average: subjectAverage,
      improvement: 0,
      lastUpdated: new Date()
    };
    this.subjectAverages.push(subjectRecord);
  } else {
    const previousAverage = subjectRecord.average;
    subjectRecord.improvement = ((subjectAverage - previousAverage) / previousAverage) * 100;
    subjectRecord.average = subjectAverage;
    subjectRecord.lastUpdated = new Date();
  }
  
  return this.save();
};

// Method to update skill level
progressSchema.methods.updateSkillLevel = function(subject, experienceGained) {
  let skill = this.skillLevels.find(s => s.subject === subject);
  
  if (!skill) {
    skill = {
      subject,
      level: 0,
      experience: 0,
      masteredTopics: [],
      weakTopics: [],
      lastUpdated: new Date(),
      trend: 'stable'
    };
    this.skillLevels.push(skill);
  }
  
  const previousLevel = skill.level;
  skill.experience += experienceGained;
  skill.level = Math.min(100, skill.level + (experienceGained / 10)); // 10 XP = 1 level point
  skill.lastUpdated = new Date();
  
  // Determine trend
  if (skill.level > previousLevel) {
    skill.trend = 'improving';
  } else if (skill.level === previousLevel) {
    skill.trend = 'stable';
  } else {
    skill.trend = 'declining';
  }
  
  return this.save();
};

// Method to add goal
progressSchema.methods.addGoal = function(goalData) {
  this.goals.push(goalData);
  return this.save();
};

// Method to update goal progress
progressSchema.methods.updateGoalProgress = function(goalId, progress) {
  const goal = this.goals.find(g => g._id.toString() === goalId.toString());
  if (goal) {
    goal.currentProgress = progress;
    
    if (progress >= goal.target.value) {
      goal.status = 'completed';
      goal.completedAt = new Date();
      
      // Add achievement
      this.achievements.push({
        title: `Goal Achieved: ${goal.title}`,
        description: `Successfully completed ${goal.title}`,
        category: goal.category,
        earnedAt: new Date(),
        points: this.calculateGoalPoints(goal)
      });
    }
  }
  
  return this.save();
};

// Method to calculate points for goal completion
progressSchema.methods.calculateGoalPoints = function(goal) {
  let basePoints = 10;
  
  // Multiply by priority
  const priorityMultiplier = {
    'low': 1,
    'medium': 1.5,
    'high': 2,
    'urgent': 3
  };
  
  basePoints *= priorityMultiplier[goal.priority] || 1;
  
  // Multiply by goal type
  const typeMultiplier = {
    'daily': 1,
    'weekly': 2,
    'monthly': 4,
    'custom': 2
  };
  
  basePoints *= typeMultiplier[goal.type] || 1;
  
  return Math.round(basePoints);
};

// Method to get learning insights
progressSchema.methods.generateInsights = function() {
  const insights = [];
  
  // Analyze study patterns
  if (this.studySessions.length >= 5) {
    const recentSessions = this.studySessions.slice(-10);
    const avgDuration = recentSessions.reduce((sum, s) => sum + s.duration, 0) / recentSessions.length;
    
    if (avgDuration < 25) {
      insights.push({
        type: 'opportunity',
        message: 'Consider longer study sessions for better focus and retention',
        confidence: 0.7,
        actionable: true
      });
    }
    
    // Check for consistency
    const daysSinceLastStudy = Math.floor((new Date() - this.streaks.current.lastStudyDate) / (1000 * 60 * 60 * 24));
    if (daysSinceLastStudy > 2) {
      insights.push({
        type: 'risk',
        message: 'Your study streak is at risk. Consider a short study session today',
        confidence: 0.9,
        actionable: true
      });
    }
  }
  
  // Analyze performance trends
  if (this.assessmentResults.length >= 3) {
    const recentScores = this.assessmentResults.slice(-5).map(r => r.score);
    const isImproving = recentScores[recentScores.length - 1] > recentScores[0];
    
    if (isImproving) {
      insights.push({
        type: 'strength',
        message: 'Your quiz scores are showing consistent improvement',
        confidence: 0.8,
        actionable: false
      });
    }
  }
  
  this.analytics.insights = insights;
  return insights;
};

export default mongoose.model('Progress', progressSchema);

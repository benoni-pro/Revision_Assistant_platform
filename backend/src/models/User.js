import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import mongoosePaginate from 'mongoose-paginate-v2';

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxLength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxLength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [4, 'Password must be at least 4 characters long'],
    select: false
  },
  
  // Role and Permissions
  role: {
    type: String,
    enum: ['student', 'teacher', 'manager', 'admin'],
    default: 'student'
  },
  permissions: [{
    type: String,
    enum: [
      'create_study_groups',
      'manage_users',
      'access_analytics',
      'manage_content',
      'moderate_discussions',
      'create_assessments',
      'view_all_progress',
      'system_admin'
    ]
  }],
  
  // Profile Information
  avatar: {
    public_id: String,
    url: String
  },
  dateOfBirth: Date,
  phone: String,
  location: {
    country: String,
    city: String,
    timezone: String
  },
  bio: {
    type: String,
    maxLength: [500, 'Bio cannot exceed 500 characters']
  },
  
  // Academic Information
  academicLevel: {
    type: String,
    enum: ['high_school', 'undergraduate', 'graduate', 'professional', 'other']
  },
  institution: {
    name: String,
    type: {
      type: String,
      enum: ['school', 'university', 'college', 'training_center', 'other']
    },
    department: String
  },
  subjects: [{
    name: String,
    level: String,
    proficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    }
  }],
  
  // Learning Preferences and AI Analysis
  learningStyle: {
    visual: { type: Number, min: 0, max: 100, default: 25 },
    auditory: { type: Number, min: 0, max: 100, default: 25 },
    kinesthetic: { type: Number, min: 0, max: 100, default: 25 },
    readingWriting: { type: Number, min: 0, max: 100, default: 25 }
  },
  preferredStudyTime: {
    morning: Boolean,
    afternoon: Boolean,
    evening: Boolean,
    night: Boolean
  },
  studyEnvironment: {
    noise_level: {
      type: String,
      enum: ['silent', 'quiet', 'moderate', 'busy']
    },
    lighting: {
      type: String,
      enum: ['bright', 'moderate', 'dim']
    },
    temperature: {
      type: String,
      enum: ['cool', 'moderate', 'warm']
    }
  },
  
  // AI Analysis and Personalization
  aiProfile: {
    strengths: [String],
    weaknesses: [String],
    learningPace: {
      type: String,
      enum: ['slow', 'moderate', 'fast'],
      default: 'moderate'
    },
    attentionSpan: {
      type: Number, // in minutes
      min: 5,
      max: 180,
      default: 30
    },
    motivationFactors: [{
      type: String,
      enum: ['achievements', 'competition', 'collaboration', 'progress_tracking', 'rewards']
    }],
    lastAnalysisUpdate: {
      type: Date,
      default: Date.now
    }
  },
  
  // Progress and Statistics
  statistics: {
    totalStudyTime: {
      type: Number,
      default: 0 // in minutes
    },
    studyStreak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 }
    },
    lastStudyDate: Date,
    completedQuizzes: { type: Number, default: 0 },
    averageQuizScore: { type: Number, min: 0, max: 100, default: 0 },
    skillLevels: [{
      subject: String,
      level: { type: Number, min: 0, max: 100, default: 0 },
      lastUpdated: { type: Date, default: Date.now }
    }]
  },
  
  // Social Features
  studyGroups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup'
  }],
  friends: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'blocked'],
      default: 'pending'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Notifications and Settings
  notifications: {
    email: {
      studyReminders: { type: Boolean, default: true },
      groupUpdates: { type: Boolean, default: true },
      progressReports: { type: Boolean, default: true },
      newFeatures: { type: Boolean, default: false }
    },
    push: {
      studyReminders: { type: Boolean, default: true },
      groupMessages: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true }
    }
  },
  
  // Account Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Email Verification
  emailVerificationToken: String,
  emailVerificationExpire: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'studyGroups': 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual to check if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: {
        loginAttempts: 1
      },
      $unset: {
        lockUntil: 1
      }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // If we're at max attempts and it's not locked already, lock the account
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + (2 * 60 * 60 * 1000) }; // 2 hours lock
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

// Method to generate JWT token (placeholder - will be implemented in auth service)
userSchema.methods.getJWTToken = function() {
  // This will be implemented in the auth service
  return null;
};

// Method to update AI profile
userSchema.methods.updateAIProfile = function(analysisData) {
  this.aiProfile = {
    ...this.aiProfile,
    ...analysisData,
    lastAnalysisUpdate: new Date()
  };
  return this.save();
};

// Method to add study time
userSchema.methods.addStudyTime = function(minutes) {
  this.statistics.totalStudyTime += minutes;
  
  // Update study streak
  const today = new Date().toDateString();
  const lastStudy = this.lastStudyDate ? this.lastStudyDate.toDateString() : null;
  
  if (lastStudy !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastStudy === yesterday.toDateString()) {
      this.statistics.studyStreak.current += 1;
    } else {
      this.statistics.studyStreak.current = 1;
    }
    
    if (this.statistics.studyStreak.current > this.statistics.studyStreak.longest) {
      this.statistics.studyStreak.longest = this.statistics.studyStreak.current;
    }
    
    this.statistics.lastStudyDate = new Date();
  }
  
  return this.save();
};

// Add pagination plugin
userSchema.plugin(mongoosePaginate);

export default mongoose.model('User', userSchema);

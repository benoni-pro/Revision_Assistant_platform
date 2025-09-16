import mongoose from 'mongoose';

const studyGroupSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Study group name is required'],
    trim: true,
    maxLength: [100, 'Study group name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Study group description is required'],
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'mixed'],
    required: true
  },
  
  // Group Settings
  privacy: {
    type: String,
    enum: ['public', 'private', 'invite_only'],
    default: 'public'
  },
  maxMembers: {
    type: Number,
    min: 2,
    max: 50,
    default: 20
  },
  language: {
    type: String,
    default: 'English'
  },
  timezone: String,
  
  // Creator and Members
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    contributions: {
      messagesCount: { type: Number, default: 0 },
      resourcesShared: { type: Number, default: 0 },
      helpfulVotes: { type: Number, default: 0 }
    }
  }],
  
  // Join Requests (for private/invite-only groups)
  joinRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    message: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  
  // Study Schedule and Sessions
  studySessions: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    scheduledAt: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // in minutes
      required: true
    },
    type: {
      type: String,
      enum: ['discussion', 'quiz', 'presentation', 'review', 'practice'],
      default: 'discussion'
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      joinedAt: Date,
      leftAt: Date,
      contribution: {
        type: String,
        enum: ['active', 'moderate', 'passive'],
        default: 'passive'
      }
    }],
    resources: [{
      title: String,
      url: String,
      type: {
        type: String,
        enum: ['document', 'video', 'link', 'image', 'audio']
      },
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    recordingUrl: String,
    notes: String
  }],
  
  // Resources and Materials
  resources: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    type: {
      type: String,
      enum: ['document', 'video', 'link', 'image', 'audio', 'quiz', 'notes'],
      required: true
    },
    url: String,
    file: {
      public_id: String,
      url: String,
      size: Number,
      format: String
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    tags: [String],
    isPublic: {
      type: Boolean,
      default: true
    },
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
      review: String,
      ratedAt: {
        type: Date,
        default: Date.now
      }
    }],
    averageRating: {
      type: Number,
      default: 0
    },
    downloadCount: {
      type: Number,
      default: 0
    }
  }],
  
  // Discussion and Chat
  discussions: [{
    title: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['general', 'questions', 'announcements', 'resources', 'study_tips'],
      default: 'general'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    tags: [String],
    messageCount: {
      type: Number,
      default: 0
    }
  }],
  
  // Goals and Milestones
  goals: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    targetDate: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    assignedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'cancelled'],
      default: 'not_started'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date
  }],
  
  // Group Analytics
  analytics: {
    totalStudyTime: {
      type: Number,
      default: 0 // in minutes
    },
    averageSessionDuration: {
      type: Number,
      default: 0
    },
    mostActiveMembers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      activityScore: Number
    }],
    popularTopics: [{
      topic: String,
      mentions: Number
    }],
    weeklyActivity: [{
      week: Date,
      sessions: Number,
      messages: Number,
      newMembers: Number
    }]
  },
  
  // Group Status and Settings
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowMemberInvites: {
      type: Boolean,
      default: true
    },
    requireApprovalForPosts: {
      type: Boolean,
      default: false
    },
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    maxFileSize: {
      type: Number,
      default: 50 // in MB
    },
    enableNotifications: {
      type: Boolean,
      default: true
    },
    studyReminders: {
      type: Boolean,
      default: true
    }
  },
  
  // Tags and Categories
  tags: [String],
  categories: [{
    type: String,
    enum: [
      'academic',
      'professional',
      'certification',
      'language_learning',
      'test_preparation',
      'skill_development',
      'research',
      'project_based'
    ]
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
studyGroupSchema.index({ subject: 1, level: 1 });
studyGroupSchema.index({ privacy: 1, isActive: 1 });
studyGroupSchema.index({ 'members.user': 1 });
studyGroupSchema.index({ creator: 1 });
studyGroupSchema.index({ tags: 1 });
studyGroupSchema.index({ categories: 1 });
studyGroupSchema.index({ createdAt: -1 });

// Virtual for member count
studyGroupSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.filter(member => member.isActive).length : 0;
});

// Virtual to check if group is full
studyGroupSchema.virtual('isFull').get(function() {
  return this.memberCount >= this.maxMembers;
});

// Virtual for average rating
studyGroupSchema.virtual('averageRating').get(function() {
  if (!this.resources || this.resources.length === 0) return 0;
  
  let totalRating = 0;
  let totalResources = 0;
  
  this.resources.forEach(resource => {
    if (resource.averageRating > 0) {
      totalRating += resource.averageRating;
      totalResources++;
    }
  });
  
  return totalResources > 0 ? totalRating / totalResources : 0;
});

// Pre-save middleware to update analytics
studyGroupSchema.pre('save', function(next) {
  // Update analytics when members change
  if (this.isModified('members')) {
    this.analytics.mostActiveMembers = this.members
      .filter(member => member.isActive)
      .map(member => ({
        user: member.user,
        activityScore: (member.contributions.messagesCount * 1) + 
                      (member.contributions.resourcesShared * 3) + 
                      (member.contributions.helpfulVotes * 2)
      }))
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, 5);
  }
  
  next();
});

// Method to add member
studyGroupSchema.methods.addMember = function(userId, role = 'member') {
  if (this.isFull) {
    throw new Error('Study group is full');
  }
  
  const existingMember = this.members.find(
    member => member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    if (!existingMember.isActive) {
      existingMember.isActive = true;
      existingMember.joinedAt = new Date();
    }
    return this;
  }
  
  this.members.push({
    user: userId,
    role: role,
    joinedAt: new Date(),
    isActive: true
  });
  
  return this;
};

// Method to remove member
studyGroupSchema.methods.removeMember = function(userId) {
  const memberIndex = this.members.findIndex(
    member => member.user.toString() === userId.toString()
  );
  
  if (memberIndex > -1) {
    this.members[memberIndex].isActive = false;
  }
  
  return this;
};

// Method to check if user is member
studyGroupSchema.methods.isMember = function(userId) {
  return this.members.some(
    member => member.user.toString() === userId.toString() && member.isActive
  );
};

// Method to check if user is moderator
studyGroupSchema.methods.isModerator = function(userId) {
  return this.moderators.some(
    moderatorId => moderatorId.toString() === userId.toString()
  ) || this.creator.toString() === userId.toString();
};

// Method to add study session
studyGroupSchema.methods.addStudySession = function(sessionData) {
  this.studySessions.push({
    ...sessionData,
    status: 'scheduled'
  });
  return this;
};

// Method to update member contribution
studyGroupSchema.methods.updateMemberContribution = function(userId, contributionType, increment = 1) {
  const member = this.members.find(
    m => m.user.toString() === userId.toString() && m.isActive
  );
  
  if (member) {
    switch (contributionType) {
      case 'message':
        member.contributions.messagesCount += increment;
        break;
      case 'resource':
        member.contributions.resourcesShared += increment;
        break;
      case 'helpful':
        member.contributions.helpfulVotes += increment;
        break;
    }
  }
  
  return this;
};

export default mongoose.model('StudyGroup', studyGroupSchema);

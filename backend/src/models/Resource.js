import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['book', 'video', 'article', 'document', 'link', 'course', 'tutorial', 'other'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    enum: ['study_material', 'reference', 'practice', 'research', 'entertainment'],
    default: 'study_material'
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all'],
    default: 'all'
  },
  author: String,
  publisher: String,
  publishedDate: Date,
  url: String,
  fileUrl: String,
  thumbnailUrl: String,
  tags: [String],
  uploadedBy: {
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
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  metadata: {
    pages: Number,
    duration: Number,
    format: String,
    size: Number,
    language: {
      type: String,
      default: 'English'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for search performance
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
resourceSchema.index({ subject: 1, type: 1 });
resourceSchema.index({ uploadedBy: 1 });
resourceSchema.index({ averageRating: -1 });
resourceSchema.index({ createdAt: -1 });

// Update average rating before save
resourceSchema.pre('save', function(next) {
  if (this.ratings && this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = totalRating / this.ratings.length;
    this.totalRatings = this.ratings.length;
  }
  next();
});

// Methods
resourceSchema.methods.addRating = function(userId, rating, review) {
  const existingRating = this.ratings.find(r => r.user.toString() === userId.toString());
  
  if (existingRating) {
    existingRating.rating = rating;
    existingRating.review = review;
  } else {
    this.ratings.push({ user: userId, rating, review });
  }
  
  return this;
};

resourceSchema.methods.incrementView = function() {
  this.views += 1;
  return this.save();
};

resourceSchema.methods.incrementDownload = function() {
  this.downloads += 1;
  return this.save();
};

export default mongoose.model('Resource', resourceSchema);

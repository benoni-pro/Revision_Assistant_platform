import User from '../models/User.js';
import Progress from '../models/Progress.js';

// @desc    Get all users (admin/manager only)
// @route   GET /api/users
// @access  Private (Admin/Manager)
export const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    // Build search query
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: [
        { path: 'studyGroups', select: 'name subject' }
      ],
      select: '-password'
    };

    const users = await User.paginate(query, options);

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private (Self/Admin/Manager)
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .populate('studyGroups', 'name subject level memberCount')
      .select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's progress data
    const progress = await Progress.findOne({ user: id });

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        progress
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private (Self/Admin)
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.role;
    delete updateData.permissions;
    delete updateData.isVerified;
    delete updateData.loginAttempts;
    delete updateData.lockUntil;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// @desc    Update user learning preferences
// @route   PUT /api/users/:id/preferences
// @access  Private (Self)
export const updateLearningPreferences = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      learningStyle,
      preferredStudyTime,
      studyEnvironment,
      motivationFactors,
      subjects
    } = req.body;

    const updateData = {};
    if (learningStyle) updateData.learningStyle = learningStyle;
    if (preferredStudyTime) updateData.preferredStudyTime = preferredStudyTime;
    if (studyEnvironment) updateData.studyEnvironment = studyEnvironment;
    if (motivationFactors) updateData['aiProfile.motivationFactors'] = motivationFactors;
    if (subjects) updateData.subjects = subjects;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Learning preferences updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update learning preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating learning preferences'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Private (Self/Admin/Manager)
export const getUserStatistics = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('statistics');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const progress = await Progress.findOne({ user: id });
    
    const stats = {
      user: user.statistics,
      progress: progress ? {
        totalStudyTime: progress.totalStudyTime,
        streaks: progress.streaks,
        achievements: progress.achievements.length,
        completedGoals: progress.goals.filter(g => g.status === 'completed').length,
        activeGoals: progress.goals.filter(g => g.status === 'active').length
      } : null
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user statistics'
    });
  }
};

// @desc    Update user role (admin only)
// @route   PUT /api/users/:id/role
// @access  Private (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, permissions } = req.body;

    if (!['student', 'teacher', 'manager', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role, permissions },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user role'
    });
  }
};

// @desc    Deactivate/Activate user account (admin only)
// @route   PUT /api/users/:id/status
// @access  Private (Admin only)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User account ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user status'
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    const { q, role, limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const query = {
      isActive: true,
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    };

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('firstName lastName email avatar role academicLevel')
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching users'
    });
  }
};

// @desc    Add friend/connection
// @route   POST /api/users/:id/friends
// @access  Private
export const addFriend = async (req, res) => {
  try {
    const { id } = req.params; // Friend's ID
    const userId = req.user._id; // Current user's ID

    if (id === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add yourself as a friend'
      });
    }

    const friend = await User.findById(id);
    if (!friend) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = await User.findById(userId);
    
    // Check if already friends or request exists
    const existingFriend = user.friends.find(f => f.user.toString() === id);
    if (existingFriend) {
      if (existingFriend.status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'Already friends'
        });
      } else if (existingFriend.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Friend request already sent'
        });
      }
    }

    // Add friend request
    user.friends.push({
      user: id,
      status: 'pending'
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Friend request sent successfully'
    });
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending friend request'
    });
  }
};

export default {
  getUsers,
  getUserProfile,
  updateUserProfile,
  updateLearningPreferences,
  getUserStatistics,
  updateUserRole,
  updateUserStatus,
  searchUsers,
  addFriend
};

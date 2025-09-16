import User from '../models/User.js';
import { verifyToken, extractTokenFromHeader, hasPermission, hasRole } from '../utils/auth.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user not found'
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login first.'
      });
    }

    if (!hasRole(req.user.role, roles)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

// Permission-based authorization
export const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login first.'
      });
    }

    // Admins have all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    const hasRequiredPermission = permissions.some(permission => 
      hasPermission(userPermissions, permission)
    );

    if (!hasRequiredPermission) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${permissions.join(' or ')}`
      });
    }

    next();
  };
};

// Check if user owns resource or has admin access
export const ownerOrAdmin = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login first.'
      });
    }

    // Admins and managers can access any resource
    if (['admin', 'manager'].includes(req.user.role)) {
      return next();
    }

    // Check ownership
    const resourceUserId = req.body[resourceUserField] || req.params.userId || req.user._id.toString();
    
    if (req.user._id.toString() !== resourceUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

// Verify email middleware
export const requireVerifiedEmail = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please login first.'
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required. Please verify your email address.'
    });
  }

  next();
};

// Rate limiting for specific users
export const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user._id.toString();
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    const userReq = userRequests.get(userId) || [];
    const validRequests = userReq.filter(time => time > windowStart);

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      });
    }

    // Add current request
    validRequests.push(now);
    userRequests.set(userId, validRequests);

    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      for (const [key, requests] of userRequests.entries()) {
        const validReq = requests.filter(time => time > windowStart);
        if (validReq.length === 0) {
          userRequests.delete(key);
        } else {
          userRequests.set(key, validReq);
        }
      }
    }

    next();
  };
};

// Study group membership middleware
export const requireStudyGroupMembership = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login first.'
      });
    }

    const studyGroupId = req.params.studyGroupId || req.body.studyGroup;
    
    if (!studyGroupId) {
      return res.status(400).json({
        success: false,
        message: 'Study group ID is required'
      });
    }

    // Admins and managers can access any study group
    if (['admin', 'manager'].includes(req.user.role)) {
      return next();
    }

    // Check if user is a member of the study group
    if (!req.user.studyGroups.includes(studyGroupId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be a member of this study group.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error checking study group membership'
    });
  }
};

// Teacher access to student data
export const teacherOrStudent = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login first.'
      });
    }

    // Admins and managers can access anything
    if (['admin', 'manager'].includes(req.user.role)) {
      return next();
    }

    const targetUserId = req.params.userId || req.params.studentId;
    
    // Users can access their own data
    if (req.user._id.toString() === targetUserId) {
      return next();
    }

    // Teachers can access student data (in future, check if student is in teacher's class)
    if (req.user.role === 'teacher') {
      // TODO: Add logic to check if student is in teacher's class
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. Insufficient permissions.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error checking permissions'
    });
  }
};

export default {
  protect,
  optionalAuth,
  authorize,
  requirePermission,
  ownerOrAdmin,
  requireVerifiedEmail,
  userRateLimit,
  requireStudyGroupMembership,
  teacherOrStudent
};

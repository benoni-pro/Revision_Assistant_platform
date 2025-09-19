import User from '../models/User.js';
import Progress from '../models/Progress.js';
import { 
  createTokenResponse, 
  generatePasswordResetToken,
  generateEmailVerificationToken,
  hashToken,
  validatePasswordStrength,
  verifyRefreshToken
} from '../utils/auth.js';
import { sendEmail } from '../utils/email.js';
import admin from 'firebase-admin';

// Initialize Firebase Admin once (if credentials are provided)
try {
  if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  }
} catch (e) {
  // Non-blocking in dev
}

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      role = 'student',
      academicLevel,
      institution
    } = req.body;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Set default permissions based on role
    const getDefaultPermissions = (userRole) => {
      switch (userRole) {
        case 'student':
          return ['create_study_groups'];
        case 'teacher':
          return ['create_study_groups', 'moderate_discussions', 'create_assessments'];
        case 'manager':
          return ['create_study_groups', 'manage_users', 'access_analytics', 'moderate_discussions', 'create_assessments', 'view_all_progress'];
        case 'admin':
          return ['system_admin', 'manage_users', 'access_analytics', 'manage_content', 'moderate_discussions', 'create_assessments', 'view_all_progress'];
        default:
          return ['create_study_groups'];
      }
    };

    // Generate email verification token
    const { verificationToken, hashedToken, expiresAt } = generateEmailVerificationToken();

    // Create user
    const userData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role,
      permissions: getDefaultPermissions(role),
      emailVerificationToken: hashedToken,
      emailVerificationExpire: expiresAt
    };

    // Add optional fields
    if (academicLevel) userData.academicLevel = academicLevel;
    if (institution) userData.institution = institution;

    const user = await User.create(userData);

    // Create progress tracking for the user
    await Progress.create({
      user: user._id,
      goals: [{
        title: 'Complete Profile',
        description: 'Fill out your learning preferences and academic information',
        type: 'custom',
        category: 'completion',
        target: { value: 1, unit: 'count' },
        priority: 'medium'
      }]
    });

    // Send verification email
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email - Revision Assistant',
        template: 'emailVerification',
        data: {
          firstName: user.firstName,
          verificationUrl
        }
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail registration if email fails
    }

    // Generate JWT tokens
    const tokenResponse = createTokenResponse(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: tokenResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    
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
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Get user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to too many failed login attempts',
        lockUntil: user.lockUntil
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate tokens
    const tokenResponse = createTokenResponse(user);
    
    // Set HTTP-only cookie for refresh token if remember me is selected
    if (rememberMe) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      };
      
      res.cookie('refreshToken', tokenResponse.refreshToken, cookieOptions);
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: tokenResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('studyGroups', 'name subject level memberCount')
      .select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile'
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: tokenFromBody } = req.body;
    const tokenFromCookie = req.cookies?.refreshToken;
    
    const refreshToken = tokenFromBody || tokenFromCookie;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Get user
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const tokenResponse = createTokenResponse(user);
    
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokenResponse
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Hash the token to compare with database
    const hashedToken = hashToken(token);
    
    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
};

// @desc    Resend email verification
// @route   POST /api/auth/resend-verification
// @access  Private
export const resendVerification = async (req, res) => {
  try {
    const user = req.user;
    
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const { verificationToken, hashedToken, expiresAt } = generateEmailVerificationToken();
    
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpire = expiresAt;
    await user.save({ validateBeforeSave: false });

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Revision Assistant',
      template: 'emailVerification',
      data: {
        firstName: user.firstName,
        verificationUrl
      }
    });

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending verification email'
    });
  }
};

// @desc    Login or register via Firebase ID token, return our JWTs
// @route   POST /api/auth/firebase
// @access  Public
export const loginWithFirebase = async (req, res) => {
  try {
    const { idToken, role = 'student', academicLevel } = req.body;

    if (!admin.apps.length) {
      return res.status(500).json({ success: false, message: 'Firebase not configured on server' });
    }

    // Verify Firebase ID token
    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email?.toLowerCase();
    const firstName = (decoded.name || '').split(' ')[0] || 'User';
    const lastName = (decoded.name || '').split(' ').slice(1).join(' ') || 'Firebase';

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email not present in Firebase token' });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        firstName,
        lastName,
        email,
        password: generateEmailVerificationToken().verificationToken, // temporary random
        role: ['student', 'teacher', 'manager', 'admin'].includes(role) ? role : 'student',
        isVerified: true
      });
      await Progress.create({ user: user._id });
    }

    // Issue our tokens
    const tokenResponse = createTokenResponse(user);
    return res.status(200).json({ success: true, message: 'Login successful', data: tokenResponse });

  } catch (error) {
    console.error('Firebase login error:', error);
    return res.status(401).json({ success: false, message: 'Invalid Firebase token' });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    // Generate password reset token
    const { resetToken, hashedToken, expiresAt } = generatePasswordResetToken();
    
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = expiresAt;
    await user.save({ validateBeforeSave: false });

    // Send password reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request - Revision Assistant',
      template: 'passwordReset',
      data: {
        firstName: user.firstName,
        resetUrl
      }
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending password reset email'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Hash token to compare with database
    const hashedToken = hashToken(token);
    
    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    // Reset login attempts if any
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
    }
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    // Check current password
    const isCurrentPasswordCorrect = await user.matchPassword(currentPassword);
    
    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'New password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
};

export default {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  loginWithFirebase
};

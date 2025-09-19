import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validateMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import {
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
} from '../controllers/authController.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('role')
    .optional()
    .isIn(['student', 'teacher', 'manager', 'admin'])
    .withMessage('Invalid role'),
  body('academicLevel')
    .optional()
    .isIn(['high_school', 'undergraduate', 'graduate', 'professional', 'other'])
    .withMessage('Invalid academic level'),
  body('institution.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Institution name must be between 2 and 100 characters'),
  body('institution.type')
    .optional()
    .isIn(['school', 'university', 'college', 'training_center', 'other'])
    .withMessage('Invalid institution type')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('Remember me must be a boolean')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email')
];

const resetPasswordValidation = [
  param('token')
    .isLength({ min: 1 })
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
];

const verifyEmailValidation = [
  param('token')
    .isLength({ min: 1 })
    .withMessage('Verification token is required')
];

const refreshTokenValidation = [
  body('refreshToken')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Refresh token cannot be empty')
];

const firebaseLoginValidation = [
  body('idToken')
    .isString()
    .isLength({ min: 10 })
    .withMessage('Valid Firebase ID token is required')
];

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh', refreshTokenValidation, validate, refreshToken);
router.get('/verify-email/:token', verifyEmailValidation, validate, verifyEmail);
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);
router.put('/reset-password/:token', resetPasswordValidation, validate, resetPassword);
router.post('/firebase', firebaseLoginValidation, validate, loginWithFirebase);

// Protected routes (require authentication)
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/resend-verification', protect, resendVerification);
router.put('/change-password', protect, changePasswordValidation, validate, changePassword);

export default router;

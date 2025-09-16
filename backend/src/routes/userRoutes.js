import express from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validateMiddleware.js';
import { protect, authorize, ownerOrAdmin } from '../middleware/authMiddleware.js';
import {
  getUsers,
  getUserProfile,
  updateUserProfile,
  updateLearningPreferences,
  getUserStatistics,
  updateUserRole,
  updateUserStatus,
  searchUsers,
  addFriend
} from '../controllers/userController.js';

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please enter a valid phone number'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
];

const searchValidation = [
  query('q')
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

const roleValidation = [
  body('role')
    .isIn(['student', 'teacher', 'manager', 'admin'])
    .withMessage('Invalid role'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array')
];

// Public routes
router.get('/search', protect, searchValidation, validate, searchUsers);

// Protected routes - users can access their own data
router.get('/:id', protect, ownerOrAdmin(), getUserProfile);
router.put('/:id', protect, ownerOrAdmin(), updateProfileValidation, validate, updateUserProfile);
router.put('/:id/preferences', protect, ownerOrAdmin(), updateLearningPreferences);
router.get('/:id/stats', protect, ownerOrAdmin(), getUserStatistics);
router.post('/:id/friends', protect, addFriend);

// Admin/Manager only routes
router.get('/', protect, authorize('admin', 'manager'), getUsers);
router.put('/:id/role', protect, authorize('admin'), roleValidation, validate, updateUserRole);
router.put('/:id/status', protect, authorize('admin'), updateUserStatus);

export default router;

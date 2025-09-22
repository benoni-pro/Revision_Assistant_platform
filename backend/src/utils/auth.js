import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generate JWT token
export const generateToken = (payload, secret = process.env.JWT_SECRET, expiresIn = process.env.JWT_EXPIRES_IN || '15m') => {
  return jwt.sign(payload, secret, { expiresIn });
};

// Generate refresh token
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { 
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  });
};

// Verify JWT token
export const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try { return jwt.verify(token, secret); } catch { throw new Error('Invalid token'); }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  try { return jwt.verify(token, process.env.JWT_REFRESH_SECRET); } catch { throw new Error('Invalid refresh token'); }
};

// Generate secure random token for password reset/email verification
export const generateSecureToken = () => crypto.randomBytes(32).toString('hex');

// Hash token for database storage
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Password reset token with expiry (10 minutes)
export const generatePasswordResetToken = () => {
  const resetToken = generateSecureToken();
  const hashedToken = hashToken(resetToken);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  return { resetToken, hashedToken, expiresAt };
};

// Email verification token with expiry (24 hours)
export const generateEmailVerificationToken = () => {
  const verificationToken = generateSecureToken();
  const hashedToken = hashToken(verificationToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { verificationToken, hashedToken, expiresAt };
};

// Create token response object
export const createTokenResponse = (user) => {
  const payload = { id: user._id, email: user.email, role: user.role, permissions: user.permissions || [] };
  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken({ id: user._id });
  return {
    accessToken,
    refreshToken,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions || [],
      avatar: user.avatar,
      isVerified: user.isVerified
    }
  };
};

// Extract token from request headers
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
};

// Permissions/roles helpers (used by middleware)
export const hasPermission = (userPermissions, requiredPermission) => {
  if (!Array.isArray(userPermissions)) return false;
  return userPermissions.includes(requiredPermission);
};

export const hasRole = (userRole, requiredRoles) => {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(userRole);
};

// Basic password validation (min length 4)
export const validatePasswordStrength = (password) => {
  const errors = [];
  if (password.length < 4) errors.push('Password must be at least 4 characters long');
  return { isValid: errors.length === 0, errors };
};

// Calculate password strength score (simplified)
export const calculatePasswordStrength = (password) => Math.min(password.length * 10, 100);

export default {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  generateSecureToken,
  hashToken,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  createTokenResponse,
  extractTokenFromHeader,
  hasPermission,
  hasRole,
  validatePasswordStrength,
  calculatePasswordStrength
};

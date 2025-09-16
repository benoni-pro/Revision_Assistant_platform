import { apiPost, apiGet, apiPut } from './api';
import { AuthResponse, LoginData, RegisterData, User } from '../types';

export class AuthService {
  // Login user
  static async login(loginData: LoginData): Promise<AuthResponse> {
    const response = await apiPost<AuthResponse>('/auth/login', loginData);
    return response.data!;
  }

  // Register new user
  static async register(registerData: RegisterData): Promise<AuthResponse> {
    const response = await apiPost<AuthResponse>('/auth/register', registerData);
    return response.data!;
  }

  // Logout user
  static async logout(): Promise<void> {
    await apiPost('/auth/logout');
  }

  // Get current user profile
  static async getCurrentUser(): Promise<User> {
    const response = await apiGet<User>('/auth/me');
    return response.data!;
  }

  // Refresh access token
  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiPost<AuthResponse>('/auth/refresh', { refreshToken });
    return response.data!;
  }

  // Verify email
  static async verifyEmail(token: string): Promise<void> {
    await apiGet(`/auth/verify-email/${token}`);
  }

  // Resend verification email
  static async resendVerification(): Promise<void> {
    await apiPost('/auth/resend-verification');
  }

  // Forgot password
  static async forgotPassword(email: string): Promise<void> {
    await apiPost('/auth/forgot-password', { email });
  }

  // Reset password
  static async resetPassword(token: string, password: string): Promise<void> {
    await apiPut(`/auth/reset-password/${token}`, { password });
  }

  // Change password
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiPut('/auth/change-password', { currentPassword, newPassword });
  }

  // Check if email exists
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await apiPost<{ exists: boolean }>('/auth/check-email', { email });
      return response.data?.exists || false;
    } catch {
      return false;
    }
  }

  // Validate password strength
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    strength: number;
  } {
    const errors: string[] = [];
    let strength = 0;

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else {
      strength += 20;
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      strength += 20;
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      strength += 20;
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      strength += 20;
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      strength += 20;
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength: Math.min(strength, 100)
    };
  }

  // Get password strength text
  static getPasswordStrengthText(strength: number): {
    text: string;
    color: string;
  } {
    if (strength < 40) {
      return { text: 'Weak', color: 'text-red-600' };
    } else if (strength < 60) {
      return { text: 'Fair', color: 'text-orange-600' };
    } else if (strength < 80) {
      return { text: 'Good', color: 'text-yellow-600' };
    } else {
      return { text: 'Strong', color: 'text-green-600' };
    }
  }
}

export default AuthService;

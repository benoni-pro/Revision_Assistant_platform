import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthResponse, LoginData, RegisterData } from '../types';
import AuthService from '../services/authService';
import { tokenManager } from '../services/api';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Initialize Firebase app if keys are present
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
let firebaseInitialized = false;
try {
  if (firebaseConfig.apiKey) {
    initializeApp(firebaseConfig);
    firebaseInitialized = true;
  }
} catch {}

// Auth state interface
interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Auth actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

// Initial state
const initialState: AuthState = {
  user: null,
  loading: true,
  isAuthenticated: false,
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...initialState,
        loading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    default:
      return state;
  }
};

// Auth context interface
interface AuthContextType extends AuthState {
  login: (loginData: LoginData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (registerData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, []);

  // Save user to localStorage when user state changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('user');
    }
  }, [state.user]);

  const checkAuth = async (): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });

      // If we have an access token, try to fetch current user
      if (tokenManager.isAuthenticated()) {
        const user = await AuthService.getCurrentUser();
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
        return;
      }

      // No access token: attempt refresh if a refresh token exists
      const savedRefresh = tokenManager.getRefreshToken();
      if (savedRefresh) {
        try {
          const refreshed = await AuthService.refreshToken(savedRefresh);
          if (refreshed?.data?.accessToken && refreshed?.data?.refreshToken) {
            const { accessToken, refreshToken } = refreshed.data;
            tokenManager.setTokens(accessToken, refreshToken);
            const user = await AuthService.getCurrentUser();
            dispatch({ type: 'AUTH_SUCCESS', payload: user });
            return;
          }
        } catch (e) {
          // fall through to localStorage user or failure
        }
      }

      // As a last resort, hydrate from saved user (non-authoritative)
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: '' });
      }
    } catch (error) {
      tokenManager.clearTokens();
      dispatch({ type: 'AUTH_FAILURE', payload: '' });
    }
  };

  const login = async (loginData: LoginData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response: AuthResponse = await AuthService.login(loginData);
      
      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        tokenManager.setTokens(accessToken, refreshToken);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
        // Role-based redirect suggestion
        if (user.role === 'teacher' || user.role === 'manager' || user.role === 'admin') {
          window.location.replace('/teacher');
        } else {
          window.location.replace('/dashboard');
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      if (!firebaseInitialized) throw new Error('Google login not configured');
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const response = await AuthService.loginWithFirebase(idToken);
      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        tokenManager.setTokens(accessToken, refreshToken);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        throw new Error(response.message || 'Google login failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  };

  const register = async (registerData: RegisterData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response: AuthResponse = await AuthService.register(registerData);
      
      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        tokenManager.setTokens(accessToken, refreshToken);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
        if (user.role === 'teacher' || user.role === 'manager' || user.role === 'admin') {
          window.location.replace('/teacher');
        } else {
          window.location.replace('/dashboard');
        }
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clearTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const verifyEmail = async (token: string): Promise<void> => {
    try {
      await AuthService.verifyEmail(token);
      // Update user verification status
      if (state.user) {
        dispatch({
          type: 'UPDATE_USER',
          payload: { isVerified: true }
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Email verification failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  };

  const resendVerification = async (): Promise<void> => {
    try {
      await AuthService.resendVerification();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend verification';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await AuthService.forgotPassword(email);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      throw new Error(message);
    }
  };

  const resetPassword = async (token: string, password: string): Promise<void> => {
    try {
      await AuthService.resetPassword(token, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
      throw new Error(message);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await AuthService.changePassword(currentPassword, newPassword);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password change failed';
      throw new Error(message);
    }
  };

  const updateUser = (userData: Partial<User>): void => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    loginWithGoogle,
    register,
    logout,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser,
    clearError,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

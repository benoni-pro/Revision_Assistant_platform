import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthResponse, LoginData, RegisterData } from '../types';
import AuthService from '../services/authService';
import { tokenManager } from '../services/api';

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
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return { ...state, loading: false, isAuthenticated: true, user: action.payload, error: null };
    case 'AUTH_FAILURE':
      return { ...state, loading: false, isAuthenticated: false, user: null, error: action.payload };
    case 'AUTH_LOGOUT':
      return { ...initialState, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'UPDATE_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : null };
    default:
      return state;
  }
};

// Auth context interface
interface AuthContextType extends AuthState {
  login: (loginData: LoginData) => Promise<void>;
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
interface AuthProviderProps { children: ReactNode; }

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => { checkAuth(); }, []);

  useEffect(() => {
    if (state.user) localStorage.setItem('user', JSON.stringify(state.user));
    else localStorage.removeItem('user');
  }, [state.user]);

  const checkAuth = async (): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      if (!tokenManager.isAuthenticated()) {
        const savedUser = localStorage.getItem('user');
        if (savedUser) dispatch({ type: 'AUTH_SUCCESS', payload: JSON.parse(savedUser) });
        else dispatch({ type: 'AUTH_FAILURE', payload: '' });
        return;
      }
            const user = await AuthService.getCurrentUser();
            dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch {
      tokenManager.clearTokens();
      dispatch({ type: 'AUTH_FAILURE', payload: '' });
    }
  };

  const login = async (loginData: LoginData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      // AuthService.login returns the payload (accessToken, refreshToken, user)
      const payload = await AuthService.login(loginData);
      if (payload && (payload as any).accessToken && (payload as any).user) {
        const { accessToken, refreshToken, user } = payload as AuthResponse;
        tokenManager.setTokens(accessToken, refreshToken);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  };

  const register = async (registerData: RegisterData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      // AuthService.register returns the payload (accessToken, refreshToken, user)
      const payload = await AuthService.register(registerData);
      if (payload && (payload as any).accessToken && (payload as any).user) {
        const { accessToken, refreshToken, user } = payload as AuthResponse;
        tokenManager.setTokens(accessToken, refreshToken);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try { await AuthService.logout(); } catch {} finally {
      tokenManager.clearTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const verifyEmail = async (token: string): Promise<void> => {
    try {
      await AuthService.verifyEmail(token);
      if (state.user) dispatch({ type: 'UPDATE_USER', payload: { isVerified: true } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Email verification failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  };

  const resendVerification = async (): Promise<void> => {
    try { await AuthService.resendVerification(); }
    catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend verification';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try { await AuthService.forgotPassword(email); }
    catch (error) { throw new Error(error instanceof Error ? error.message : 'Failed to send reset email'); }
  };

  const resetPassword = async (token: string, password: string): Promise<void> => {
    try { await AuthService.resetPassword(token, password); }
    catch (error) { throw new Error(error instanceof Error ? error.message : 'Password reset failed'); }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try { await AuthService.changePassword(currentPassword, newPassword); }
    catch (error) { throw new Error(error instanceof Error ? error.message : 'Password change failed'); }
  };

  const updateUser = (userData: Partial<User>): void => { dispatch({ type: 'UPDATE_USER', payload: userData }); };
  const clearError = (): void => { dispatch({ type: 'CLEAR_ERROR' }); };

  const value: AuthContextType = {
    ...state,
    login,
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;

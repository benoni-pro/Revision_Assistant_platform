import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types';

// Base API configuration
const envBase = (import.meta.env.VITE_API_BASE_URL as string) || '';
const API_BASE_URL = envBase || (import.meta.env.DEV ? '/api' : 'http://localhost:5000/api');

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Token management
export const tokenManager = {
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  clearTokens: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  isAuthenticated: (): boolean => {
    return !!tokenManager.getAccessToken();
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        if (response.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          tokenManager.setTokens(accessToken, newRefreshToken);

          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        tokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Generic API error handler
export const handleApiError = (error: AxiosError): string => {
  if (error.response?.data) {
    const errorData = error.response.data as ApiResponse;
    return errorData.message || 'An unexpected error occurred';
  } else if (error.request) {
    return 'Network error - please check your connection';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};

// Generic API request wrapper
export const apiRequest = async <T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await api[method](url, data, config);
    return response.data;
  } catch (error) {
    const message = handleApiError(error as AxiosError);
    throw new Error(message);
  }
};

// Specific API methods
export const apiGet = <T>(url: string, config?: AxiosRequestConfig) =>
  apiRequest<T>('get', url, undefined, config);

export const apiPost = <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
  apiRequest<T>('post', url, data, config);

export const apiPut = <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
  apiRequest<T>('put', url, data, config);

export const apiPatch = <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
  apiRequest<T>('patch', url, data, config);

export const apiDelete = <T>(url: string, config?: AxiosRequestConfig) =>
  apiRequest<T>('delete', url, undefined, config);

// Firebase login exchange
export const apiFirebaseLogin = async (idToken: string) => {
  return apiPost('/auth/firebase', { idToken });
};

// File upload helper
export const uploadFile = async (
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<any>> => {
  const formData = new FormData();
  formData.append('file', file);

  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  };

  return apiPost(url, formData, config);
};

// Download file helper
export const downloadFile = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await api.get(url, { responseType: 'blob' });
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    throw new Error(handleApiError(error as AxiosError));
  }
};

// Health check
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    await apiGet('/health');
    return true;
  } catch {
    return false;
  }
};

export default api;

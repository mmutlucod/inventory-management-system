import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@store/auth-store';
import { getCurrentLanguage } from '@localization/i18n';
import { API_BASE_URL, API_TIMEOUT } from '@utils/constants';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    const language = getCurrentLanguage();
    
    if (config.headers) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      config.headers['X-Lang'] = language === 'tr' ? 'tr-TR' : 'en-US';
      config.headers['Accept-Language'] = language === 'tr' ? 'tr-TR' : 'en-US';
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { refreshToken } = useAuthStore.getState();
        
        if (refreshToken) {
          const language = getCurrentLanguage();
          
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            { refreshToken },
            {
              headers: {
                'X-Lang': language === 'tr' ? 'tr-TR' : 'en-US',
                'Accept-Language': language === 'tr' ? 'tr-TR' : 'en-US',
              },
            }
          );
          
          const { token: newToken, refreshToken: newRefreshToken } = response.data;
          
          useAuthStore.getState().setAuth(
            useAuthStore.getState().user!,
            newToken,
            newRefreshToken
          );
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      });
    }
    
    const errorData = error.response?.data as any;
    return Promise.reject({
      message: errorData?.error || errorData?.message || error.message || 'An error occurred',
      code: error.code,
      statusCode: error.response?.status,
      errors: errorData?.errors,
    });
  }
);

export default api;

export const apiClient = {
  get: <T = any>(url: string, config?: any) => 
    api.get<T>(url, config).then(res => res.data),
  
  post: <T = any>(url: string, data?: any, config?: any) => 
    api.post<T>(url, data, config).then(res => res.data),
  
  put: <T = any>(url: string, data?: any, config?: any) => 
    api.put<T>(url, data, config).then(res => res.data),
  
  delete: <T = any>(url: string, config?: any) => 
    api.delete<T>(url, config).then(res => res.data),
  
  patch: <T = any>(url: string, data?: any, config?: any) => 
    api.patch<T>(url, data, config).then(res => res.data),
};
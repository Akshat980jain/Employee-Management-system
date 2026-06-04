import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

// Use hosted backend in production, proxy in development
const API_BASE_URL = import.meta.env.PROD
    ? 'https://ems-backend-q0vm.onrender.com/api'
    : '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = useAuthStore.getState().refreshToken;

                if (!refreshToken) {
                    useAuthStore.getState().logout();
                    return Promise.reject(error);
                }

                // Try to refresh token
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                useAuthStore.getState().setTokens(accessToken, newRefreshToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export function getErrorMessage(error: any, fallback: string = 'Request failed'): string {
    const responseData = error?.response?.data;
    if (responseData) {
        if (typeof responseData === 'object' && responseData.error?.message) {
            return responseData.error.message;
        }
        if (typeof responseData === 'string') {
            if (responseData.includes('<!DOCTYPE html>') || responseData.includes('<html')) {
                const status = error.response?.status ? ` (${error.response.status})` : '';
                return `Server is temporarily unavailable${status}. Please try again later.`;
            }
            return responseData;
        }
    }
    return error?.message || fallback;
}

export default api;

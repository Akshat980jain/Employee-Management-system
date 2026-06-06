import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

// Use hosted backend in production, proxy in development
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocalhost
    ? '/api'
    : 'https://ems-backend-q0vm.onrender.com/api';

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

const BACKEND_URL = isLocalhost
    ? 'http://localhost:3000'
    : 'https://ems-backend-q0vm.onrender.com';

function transformAvatars(obj: any): any {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => transformAvatars(item));
    }

    const newObj: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const val = obj[key];
            if (key === 'avatar' && typeof val === 'string' && val.startsWith('/uploads')) {
                newObj[key] = `${BACKEND_URL}${val}`;
            } else {
                newObj[key] = transformAvatars(val);
            }
        }
    }
    return newObj;
}

// Response interceptor to handle token refresh and transform relative avatar URLs
api.interceptors.response.use(
    (response) => {
        if (response.data) {
            response.data = transformAvatars(response.data);
        }
        return response;
    },
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

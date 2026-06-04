import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../services/api';
import { User, Organization } from '../types';

interface AuthState {
    user: User | null;
    organization: Organization | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isVerified: boolean;
    isLoading: boolean;
    permissions: string[];
    pendingVerification: boolean;
    rememberMe: boolean;
}

interface AuthActions {
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<{ pendingVerification: boolean }>;
    logout: () => void;
    setTokens: (accessToken: string, refreshToken: string) => void;
    fetchUser: () => Promise<void>;
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (...permissions: string[]) => boolean;
    checkVerificationStatus: () => Promise<boolean>;
    setRememberMe: (rememberMe: boolean) => void;
}

interface RegisterData {
    organizationName?: string;
    organizationId?: string;
    industry?: string;
    size?: string;
    timezone?: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    message?: string;
}

export const useAuthStore = create<AuthState & AuthActions>()(
    persist(
        (set, get) => ({
            user: null,
            organization: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isVerified: true,
            isLoading: true,
            permissions: [],
            pendingVerification: false,
            rememberMe: false,

            setRememberMe: (rememberMe: boolean) => set({ rememberMe }),

            login: async (email: string, password: string) => {
                try {
                    const response = await api.post('/auth/login', { email, password });
                    const { user, organization, accessToken, refreshToken } = response.data.data;

                    set({
                        user,
                        organization,
                        accessToken,
                        refreshToken,
                        isAuthenticated: true,
                        isVerified: user.isVerified !== false,
                        isLoading: false,
                        pendingVerification: user.isVerified === false,
                    });

                    // Fetch full user with permissions
                    await get().fetchUser();
                } catch (error: any) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            register: async (data: RegisterData) => {
                try {
                    const response = await api.post('/auth/register', data);
                    const { user, organization, accessToken, refreshToken, pendingVerification } = response.data.data;

                    set({
                        user,
                        organization,
                        accessToken,
                        refreshToken,
                        isAuthenticated: true,
                        isVerified: !pendingVerification,
                        isLoading: false,
                        pendingVerification: pendingVerification || false,
                    });

                    if (!pendingVerification) {
                        await get().fetchUser();
                    }

                    return { pendingVerification: pendingVerification || false };
                } catch (error: any) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: () => {
                const refreshToken = get().refreshToken;
                if (refreshToken) {
                    api.post('/auth/logout', { refreshToken }).catch(() => { });
                }

                set({
                    user: null,
                    organization: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    isVerified: true,
                    isLoading: false,
                    permissions: [],
                    pendingVerification: false,
                });
            },

            setTokens: (accessToken: string, refreshToken: string) => {
                set({ accessToken, refreshToken });
            },

            fetchUser: async () => {
                try {
                    const hasCachedSession = get().isAuthenticated && get().user;
                    if (!hasCachedSession) {
                        set({ isLoading: true });
                    }
                    const response = await api.get('/auth/me');
                    const userData = response.data.data;

                    set({
                        user: userData,
                        organization: userData.organization,
                        permissions: userData.permissions || [],
                        isAuthenticated: true,
                        isVerified: userData.isVerified !== false,
                        isLoading: false,
                        pendingVerification: userData.isVerified === false,
                    });
                } catch (error: any) {
                    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
                    if (isAuthError) {
                        set({
                            user: null,
                            organization: null,
                            accessToken: null,
                            refreshToken: null,
                            isAuthenticated: false,
                            isVerified: true,
                            isLoading: false,
                            permissions: [],
                            pendingVerification: false,
                        });
                    } else {
                        set({ isLoading: false });
                    }
                }
            },

            hasPermission: (permission: string) => {
                const { permissions } = get();
                return permissions.includes('*:*') || permissions.includes(permission);
            },

            hasAnyPermission: (...permissionList: string[]) => {
                const { permissions } = get();
                if (permissions.includes('*:*')) return true;
                return permissionList.some(p => permissions.includes(p));
            },

            checkVerificationStatus: async () => {
                try {
                    const response = await api.get('/join-requests/my');
                    const requests = response.data.data;
                    const pendingRequest = requests.find((r: any) => r.status === 'PENDING');
                    const approvedRequest = requests.find((r: any) => r.status === 'APPROVED');

                    if (approvedRequest) {
                        // Request was approved, fetch updated user
                        await get().fetchUser();
                        return true;
                    }

                    return !pendingRequest;
                } catch (error) {
                    return false;
                }
            },
        }),
        {
            name: 'ems-auth',
            storage: createJSONStorage(() => ({
                getItem: (name: string) => {
                    const local = localStorage.getItem(name);
                    if (local) return local;
                    return sessionStorage.getItem(name);
                },
                setItem: (name: string, value: string) => {
                    try {
                        const parsed = JSON.parse(value);
                        const rememberMe = parsed?.state?.rememberMe;
                        if (rememberMe) {
                            localStorage.setItem(name, value);
                            sessionStorage.removeItem(name);
                        } else {
                            sessionStorage.setItem(name, value);
                            localStorage.removeItem(name);
                        }
                    } catch (e) {
                        localStorage.setItem(name, value);
                    }
                },
                removeItem: (name: string) => {
                    localStorage.removeItem(name);
                    sessionStorage.removeItem(name);
                }
            })),
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                user: state.user,
                organization: state.organization,
                permissions: state.permissions,
                isAuthenticated: state.isAuthenticated,
                isVerified: state.isVerified,
                pendingVerification: state.pendingVerification,
                rememberMe: state.rememberMe,
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    if (state.accessToken) {
                        if (state.isAuthenticated && state.user) {
                            state.isLoading = false;
                        }
                        state.fetchUser();
                    } else {
                        state.isLoading = false;
                    }
                }
            },
        }
    )
);

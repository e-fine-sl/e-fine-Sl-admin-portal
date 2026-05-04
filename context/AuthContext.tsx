'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AdminUser, LoginCredentials, AuthResponse } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
    user: AdminUser | null;
    token: string | null;
    loading: boolean;
    login: (credentials: LoginCredentials, totpToken?: string) => Promise<boolean | { requireTwoFactor: boolean }>;
    logout: (force?: boolean) => Promise<void>;
    updateUser: (userData: AdminUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setToken(null);
            setLoading(false);
            return;
        }

        setToken(token);

        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('sessionToken');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials, totpToken?: string) => {
        try {
            const response = await api.post('/admin/login', {
                ...credentials,
                totpToken
            });

            const { token, accessToken, refreshToken, sessionToken, user } = response.data;

            // Store all tokens
            localStorage.setItem('token', accessToken || token);
            localStorage.setItem('refreshToken', refreshToken || '');
            localStorage.setItem('sessionToken', sessionToken || '');
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            setToken(accessToken || token);

            toast.success('Login successful');
            router.push('/');
            return true;
        } catch (error: any) {
            // Check if 2FA is required
            if (error.response?.status === 403 && error.response?.data?.requireTwoFactor) {
                return { requireTwoFactor: true };
            }

            console.error('Login failed:', error);
            toast.error(error.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const logout = async (force?: boolean) => {
        try {
            const sessionToken = localStorage.getItem('sessionToken');
            if (sessionToken) {
                // Revoke the session in the DB
                await api.post('/admin/logout', { sessionToken });
            }
        } catch (err) {
            // Always clear local state even if API call fails
            console.warn('Logout API call failed, clearing local session anyway.');
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('sessionToken');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
            router.push('/login');
            toast.success('Logged out successfully');
        }
    };

    const updateUser = (userData: AdminUser) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

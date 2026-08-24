"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (payload: { name: string; email: string; password: string; role?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }>= ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, attempt to load the current user if tokens exist
    const load = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const resp = await api.get('/auth/me');
        if (resp.data?.data) {
          const currentUser = resp.data.data as User;
          setUser(currentUser);
          if (currentUser.role) {
            localStorage.setItem('userRole', currentUser.role);
          }
        }
      } catch (err) {
        console.warn('Could not fetch current user', err);
        // attempt logout cleanup
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const resp = await api.post('/auth/login', { email, password });
      const data = resp.data?.data;
      if (data?.tokens?.accessToken) {
        localStorage.setItem('accessToken', data.tokens.accessToken);
        if (data.tokens.refreshToken) localStorage.setItem('refreshToken', data.tokens.refreshToken);
      }
      // load user
      const me = await api.get('/auth/me');
      const currentUser = me.data?.data ?? null;
      setUser(currentUser);
      if (currentUser?.role) {
        localStorage.setItem('userRole', currentUser.role);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      // ignore
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      setUser(null);
    }
  };

  const register = async (payload: { name: string; email: string; password: string; role?: string }) => {
    setLoading(true);
    try {
      const resp = await api.post('/auth/register', payload);
      const data = resp.data?.data;
      if (data?.tokens?.accessToken) {
        localStorage.setItem('accessToken', data.tokens?.accessToken);
        if (data.tokens.refreshToken) localStorage.setItem('refreshToken', data.tokens.refreshToken);
      }
      const me = await api.get('/auth/me');
      const currentUser = me.data?.data ?? null;
      setUser(currentUser);
      if (currentUser?.role) {
        localStorage.setItem('userRole', currentUser.role);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

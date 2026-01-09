'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Admin = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AuthContextValue = {
  admin: Admin | null;
  token: string | null;
  setAuth: (payload: { admin: Admin; token: string }) => void;
  logout: () => void;
  isReady: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null;
    const storedAdmin = typeof window !== 'undefined' ? localStorage.getItem('admin_user') : null;
    if (storedToken) setToken(storedToken);
    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch {
        localStorage.removeItem('admin_user');
      }
    }
    setIsReady(true);
  }, []);

  const setAuth = (payload: { admin: Admin; token: string }) => {
    setAdmin(payload.admin);
    setToken(payload.token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_access_token', payload.token);
      localStorage.setItem('admin_user', JSON.stringify(payload.admin));
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_user');
    }
  };

  const value = useMemo(() => ({ admin, token, setAuth, logout, isReady }), [admin, token, isReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAdminAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAdminAuthContext must be used within AuthProvider');
  return ctx;
};

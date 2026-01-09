'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '../../types';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  setAuth: (payload: { user: AuthUser; token: string }) => void;
  logout: () => void;
  isReady: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser));
    setIsReady(true);
  }, []);

  const setAuth = (payload: { user: AuthUser; token: string }) => {
    setUser(payload.user);
    setToken(payload.token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', payload.token);
      localStorage.setItem('user', JSON.stringify(payload.user));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
    router.push('/login');
  };

  const value = useMemo(
    () => ({ user, token, setAuth, logout, isReady }),
    [user, token, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

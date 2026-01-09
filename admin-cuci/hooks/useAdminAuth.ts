'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthContext } from '../components/providers/AuthProvider';

export const useAdminAuth = () => {
  const { token, isReady, logout } = useAdminAuthContext();
  return { token, isReady, logout };
};

export const useRequireAdmin = () => {
  const { token, isReady } = useAdminAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !token) {
      router.replace('/login');
    }
  }, [isReady, token, router]);

  return { token, isReady, isAuthenticated: Boolean(token) };
};

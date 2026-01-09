'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/providers/AuthProvider';

export const useRequireAuth = () => {
  const { token, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !token) {
      router.replace('/login');
    }
  }, [isReady, token, router]);

  return { token, isReady, isAuthenticated: Boolean(token) };
};

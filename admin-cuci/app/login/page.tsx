'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { adminApi } from '../../lib/adminApiClient';
import { useAdminAuthContext } from '../../components/providers/AuthProvider';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAdminAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => adminApi.login({ email, password }),
    onSuccess: (data) => {
      setAuth({ admin: data.admin, token: data.accessToken });
      router.push('/');
    },
    onError: (err: any) => alert(err?.message || 'Email atau password admin salah')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Lengkapi email dan password');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@laundry.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-60"
        >
          {mutation.isPending ? 'Masuk...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

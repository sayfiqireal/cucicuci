'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/apiClient';
import { useAuth } from '../../components/providers/AuthProvider';

export default function LoginPage() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const mutation = useMutation({
    mutationFn: () => api.login({ email, password }),
    onSuccess: (data) => {
      setAuth({ user: data.user, token: data.accessToken });
      router.push('/');
    },
    onError: (err: any) => {
      alert(err?.message || 'Email atau password salah');
    }
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
    <div className="max-w-md mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="user@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
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
      <p className="text-sm text-slate-600 mt-4">
        Belum punya akun?{' '}
        <Link href="/register" className="text-primary font-medium">
          Register
        </Link>
      </p>
    </div>
  );
}

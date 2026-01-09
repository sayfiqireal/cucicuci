'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/apiClient';
import { useAuth } from '../../components/providers/AuthProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const mutation = useMutation({
    mutationFn: () => api.register(form),
    onSuccess: (data) => {
      setAuth({ user: data.user, token: data.accessToken });
      router.push('/');
    },
    onError: (err: any) => alert(err?.message || 'Registrasi gagal')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.name) {
      alert('Lengkapi semua field');
      return;
    }
    if (form.password.length < 8) {
      alert('Password minimal 8 karakter');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">Nama</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            placeholder="user@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={form.password}
            minLength={8}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-60"
        >
          {mutation.isPending ? 'Mendaftar...' : 'Register'}
        </button>
      </form>
      <p className="text-sm text-slate-600 mt-4">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-primary font-medium">
          Login
        </Link>
      </p>
    </div>
  );
}

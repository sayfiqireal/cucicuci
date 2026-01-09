'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../hooks/useAdminAuth';
import ThemeToggle from './ThemeToggle';

export default function AdminHeader() {
  const router = useRouter();
  const { token, logout, isReady } = useAdminAuth();

  return (
    <header className="w-full border-b border-slate-200 bg-white/80 dark:bg-slate-900/80 dark:border-slate-800 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="text-lg font-semibold text-primary">
          Laundry Admin Panel
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {!isReady ? (
            <span className="text-slate-500">Loading...</span>
          ) : token ? (
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="px-3 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Logout
            </button>
          ) : (
            <Link href="/login" className="text-slate-700 dark:text-slate-200">
              Admin Login
            </Link>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

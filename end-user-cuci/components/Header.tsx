'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './providers/AuthProvider';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const { user, logout, isReady } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) =>
    pathname === path ? 'text-primary font-semibold' : 'text-slate-700';

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20 dark:bg-slate-900/80 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="text-lg font-semibold text-primary">
          Laundry Service
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {!isReady ? (
            <span className="text-slate-500">Loading...</span>
          ) : user ? (
            <>
              <Link href="/dashboard" className={isActive('/dashboard')}>
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={isActive('/login')}>
                Login
              </Link>
              <Link
                href="/register"
                className="px-3 py-1 rounded-md bg-primary text-white hover:bg-primary-dark"
              >
                Register
              </Link>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

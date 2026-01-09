'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuthContext } from './providers/AuthProvider';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/service-history', label: 'Service History' },
  { href: '/queue', label: 'Queue' },
  { href: '/users', label: 'Users' }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { token } = useAdminAuthContext();

  // Hide sidebar on login page or when not authenticated
  if (!token || pathname === '/login') return null;

  const isActive = (href: string) =>
    pathname === href ? 'text-primary font-semibold' : 'text-slate-700 dark:text-slate-200';

  return (
    <aside className="w-56 shrink-0">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-4 h-full sticky top-16 flex flex-col">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-300 mb-3">Navigation</h2>
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={isActive(item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}

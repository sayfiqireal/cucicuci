'use client';

import { useTheme } from './providers/ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

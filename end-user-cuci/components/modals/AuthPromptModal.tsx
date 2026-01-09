'use client';

import { useRouter } from 'next/navigation';

type Props = {
  open: boolean;
  onClose: () => void;
  message?: string;
};

export default function AuthPromptModal({ open, onClose, message }: Props) {
  const router = useRouter();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm p-6 relative border border-slate-200 dark:border-slate-800">
        <button
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-50">Butuh Login</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          {message || 'Silakan login untuk melanjutkan aksi ini.'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/login')}
            className="flex-1 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark"
          >
            Login Sekarang
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Nanti
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/apiClient';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function QueueModal({ open, onClose }: Props) {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['queue'],
    queryFn: () => api.getQueue(),
    enabled: open
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-3xl p-6 relative border border-slate-200 dark:border-slate-800">
        <button
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          onClick={onClose}
        >
          ✕
        </button>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Antrian Saat Ini</h3>
          <button
            onClick={() => refetch()}
            className="text-sm px-3 py-1 rounded-md border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            disabled={isFetching}
          >
            {isFetching ? 'Memuat...' : 'Refresh'}
          </button>
        </div>

        {isLoading ? (
          <p className="text-slate-600 dark:text-slate-300">Memuat antrian...</p>
        ) : isError ? (
          <p className="text-red-500">Gagal memuat antrian.</p>
        ) : data && data.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.map((item) => (
              <div
                key={item.orderId}
                className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Posisi #{item.position}</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">
                    {item.serviceType.toUpperCase()} • {item.userName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-300">ETA</p>
                  <p className="text-lg font-semibold">
                    {item.etaMinutes ? `${item.etaMinutes} menit` : '-'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-300">Belum ada antrian saat ini.</p>
        )}
      </div>
    </div>
  );
}

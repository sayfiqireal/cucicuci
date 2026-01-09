'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/apiClient';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MyQueueModal({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['my-queue'],
    queryFn: () => api.getMyQueue(),
    enabled: open
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId: number) => api.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-queue'] });
      alert('Order dibatalkan');
    },
    onError: (err: any) => alert(err?.message || 'Gagal membatalkan order')
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl p-6 relative border border-slate-200 dark:border-slate-800">
        <button
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          onClick={onClose}
        >
          x
        </button>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Antrian Saya</h3>
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
            {data.map((item) => {
              const status = item.status || 'queued';
              const isQueued = status === 'queued';
              return (
                <div
                  key={item.orderId}
                  className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Posisi #{item.position} - {item.serviceType.toUpperCase()}
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">Order #{item.orderId}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Jumlah di depan: {item.aheadCount}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {isQueued ? 'Queued' : 'Sedang dalam proses'}
                    </span>
                    <button
                      onClick={() => cancelMutation.mutate(item.orderId)}
                      disabled={!isQueued || cancelMutation.isPending}
                      className="px-3 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-300">Anda tidak punya antrian aktif.</p>
        )}
      </div>
    </div>
  );
}

import { AdminQueueItem } from '../../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApiClient';

type Props = {
  data?: AdminQueueItem[];
  isLoading?: boolean;
  isError?: boolean;
};

export default function QueueTable({ data, isLoading, isError }: Props) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AdminQueueItem['status'] }) =>
      adminApi.updateOrderStatus(id, status || 'queued'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-queue'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (err: any) => alert(err?.message || 'Gagal mengubah status')
  });

  if (isLoading) return <p className="text-slate-600 dark:text-slate-300">Memuat antrian...</p>;
  if (isError) return <p className="text-red-500">Gagal memuat antrian.</p>;
  if (!data || data.length === 0) return <p className="text-slate-600 dark:text-slate-300">Belum ada antrian.</p>;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100 dark:bg-slate-800 text-left text-slate-700 dark:text-slate-200">
          <tr>
            <th className="px-4 py-2">Posisi</th>
            <th className="px-4 py-2">User</th>
            <th className="px-4 py-2">Layanan</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">ETA</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr
              key={item.orderId ?? item.id ?? `${item.position}-${item.userName}-${idx}`}
              className="border-t border-slate-200 dark:border-slate-800"
            >
              <td className="px-4 py-2 font-semibold">
                {item.position ? `#${item.position}` : '-'}
              </td>
              <td className="px-4 py-2">{item.userName}</td>
              <td className="px-4 py-2">{item.serviceType.toUpperCase()}</td>
              <td className="px-4 py-2">{item.status || 'queued'}</td>
              <td className="px-4 py-2">{item.etaMinutes ? `${item.etaMinutes} menit` : '-'}</td>
              <td className="px-4 py-2">
                <select
                  className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2 py-1 text-sm"
                  disabled={mutation.isPending || (!item.orderId && !item.id)}
                  value={item.status || 'queued'}
                  onChange={(e) => {
                    const statusOption = e.target.value as AdminQueueItem['status'];
                    if (!statusOption || statusOption === (item.status || 'queued')) return;
                    mutation.mutate({
                      id: item.orderId || item.id || 0,
                      status: statusOption
                    });
                  }}
                >
                  <option value="pending">pending</option>
                  <option value="queued">queued</option>
                  <option value="in_progress">in_progress</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

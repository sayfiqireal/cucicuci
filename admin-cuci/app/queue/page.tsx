'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApiClient';
import { useRequireAdmin } from '../../hooks/useAdminAuth';
import QueueTable from '../../components/tables/QueueTable';

export default function QueuePage() {
  const { isReady, isAuthenticated } = useRequireAdmin();
  const queueQuery = useQuery({
    queryKey: ['admin-queue'],
    queryFn: () => adminApi.queue(),
    enabled: isAuthenticated
  });

  if (!isReady) return <p className="text-slate-600">Memuat...</p>;
  if (!isAuthenticated) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Queue</h1>
        <button
          onClick={() => queueQuery.refetch()}
          className="px-3 py-1 rounded-md border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 text-sm"
        >
          Refresh
        </button>
      </div>
      <QueueTable data={queueQuery.data} isLoading={queueQuery.isLoading} isError={queueQuery.isError} />
    </div>
  );
}

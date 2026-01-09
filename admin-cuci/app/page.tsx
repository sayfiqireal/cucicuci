'use client';

import { useQuery } from '@tanstack/react-query';
import StatsCard from '../components/StatsCard';
import { adminApi } from '../lib/adminApiClient';
import { useRequireAdmin } from '../hooks/useAdminAuth';
import QueueTable from '../components/tables/QueueTable';

export default function AdminDashboardPage() {
  const { isReady, isAuthenticated } = useRequireAdmin();

  const summaryQuery = useQuery({
    queryKey: ['admin-summary'],
    queryFn: () => adminApi.summary(),
    enabled: isAuthenticated
  });

  const queueQuery = useQuery({
    queryKey: ['admin-queue'],
    queryFn: () => adminApi.queue(),
    enabled: isAuthenticated
  });

  if (!isReady) return <p className="text-slate-600">Memuat...</p>;
  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <StatsCard
          title="Penghasilan Bulan Ini"
          value={
            summaryQuery.data
              ? `IDR ${summaryQuery.data.monthlyRevenue.toLocaleString('id-ID')}`
              : '-'
          }
          hint="Currency: IDR"
        />
        <StatsCard title="Antrian Sekarang" value={summaryQuery.data ? String(summaryQuery.data.queueCount) : '-'} />
        <StatsCard title="Total User" value={summaryQuery.data ? String(summaryQuery.data.usersCount) : '-'} />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Antrian</h2>
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

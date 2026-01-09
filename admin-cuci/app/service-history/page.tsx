'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApiClient';
import { useRequireAdmin } from '../../hooks/useAdminAuth';
import ServiceHistoryTable from '../../components/tables/ServiceHistoryTable';

export default function ServiceHistoryPage() {
  const { isReady, isAuthenticated } = useRequireAdmin();
  const [page, setPage] = useState(1);

  const ordersQuery = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: () => adminApi.orders(`page=${page}&limit=10`),
    enabled: isAuthenticated
  });

  if (!isReady) return <p className="text-slate-600">Memuat...</p>;
  if (!isAuthenticated) return null;

  const pagination = ordersQuery.data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Riwayat Layanan</h1>
        <button
          onClick={() => ordersQuery.refetch()}
          className="px-3 py-1 rounded-md border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 text-sm"
        >
          Refresh
        </button>
      </div>
      <ServiceHistoryTable
        data={ordersQuery.data?.data}
        isLoading={ordersQuery.isLoading}
        isError={ordersQuery.isError}
      />
      {pagination && (
        <div className="flex items-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded-md border border-slate-200 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800 text-sm"
          >
            Prev
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Page {pagination.currentPage || pagination.page || page} / {pagination.totalPages || '?'}
          </span>
          <button
            disabled={pagination.currentPage >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded-md border border-slate-200 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

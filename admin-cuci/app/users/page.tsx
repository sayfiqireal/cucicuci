'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApiClient';
import { useRequireAdmin } from '../../hooks/useAdminAuth';
import UsersTable from '../../components/tables/UsersTable';

export default function UsersPage() {
  const { isReady, isAuthenticated } = useRequireAdmin();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const usersQuery = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => adminApi.users(`page=${page}&limit=10${search ? `&search=${encodeURIComponent(search)}` : ''}`),
    enabled: isAuthenticated
  });

  if (!isReady) return <p className="text-slate-600">Memuat...</p>;
  if (!isAuthenticated) return null;

  const pagination = usersQuery.data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Users</h1>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama/email"
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm"
          />
          <button
            onClick={() => usersQuery.refetch()}
            className="px-3 py-2 rounded-md border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 text-sm"
          >
            Cari
          </button>
        </div>
      </div>
      <UsersTable data={usersQuery.data?.data} isLoading={usersQuery.isLoading} isError={usersQuery.isError} />
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

import { AdminUserItem } from '../../types';

type Props = {
  data?: AdminUserItem[];
  isLoading?: boolean;
  isError?: boolean;
};

export default function UsersTable({ data, isLoading, isError }: Props) {
  if (isLoading) return <p className="text-slate-600 dark:text-slate-300">Memuat data...</p>;
  if (isError) return <p className="text-red-500">Gagal memuat data.</p>;
  if (!data || data.length === 0) return <p className="text-slate-600 dark:text-slate-300">Belum ada data.</p>;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100 dark:bg-slate-800 text-left text-slate-700 dark:text-slate-200">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Nama</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Dibuat</th>
            <th className="px-4 py-2">Total Order</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => (
            <tr key={user.id} className="border-t border-slate-200 dark:border-slate-800">
              <td className="px-4 py-2 font-semibold">{user.id}</td>
              <td className="px-4 py-2">{user.name}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.role}</td>
              <td className="px-4 py-2">{new Date(user.createdAt).toLocaleDateString('id-ID')}</td>
              <td className="px-4 py-2">{user.totalOrders ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

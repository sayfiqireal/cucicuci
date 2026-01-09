import { AdminOrderItem } from '../../types';

type Props = {
  data?: AdminOrderItem[];
  isLoading?: boolean;
  isError?: boolean;
};

export default function ServiceHistoryTable({ data, isLoading, isError }: Props) {
  if (isLoading) return <p className="text-slate-600 dark:text-slate-300">Memuat data...</p>;
  if (isError) return <p className="text-red-500">Gagal memuat data.</p>;
  if (!data || data.length === 0) return <p className="text-slate-600 dark:text-slate-300">Belum ada data.</p>;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100 dark:bg-slate-800 text-left text-slate-700 dark:text-slate-200">
          <tr>
            <th className="px-4 py-2">Order ID</th>
            <th className="px-4 py-2">User</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Layanan</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Harga</th>
            <th className="px-4 py-2">Dibuat</th>
            <th className="px-4 py-2">Selesai</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t border-slate-200 dark:border-slate-800">
              <td className="px-4 py-2 font-semibold">{item.id}</td>
              <td className="px-4 py-2">{item.userName}</td>
              <td className="px-4 py-2">{item.userEmail}</td>
              <td className="px-4 py-2">{item.serviceType.toUpperCase()}</td>
              <td className="px-4 py-2">{item.status}</td>
              <td className="px-4 py-2">Rp{item.price.toLocaleString('id-ID')}</td>
              <td className="px-4 py-2">{new Date(item.createdAt).toLocaleString('id-ID')}</td>
              <td className="px-4 py-2">
                {item.completedAt ? new Date(item.completedAt).toLocaleString('id-ID') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

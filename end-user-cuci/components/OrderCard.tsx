'use client';

type Props = {
  onOpen: () => void;
};

export default function OrderCard({ onOpen }: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">Pesan Cuci</h2>
      <p className="text-slate-600 dark:text-slate-300 mb-4">
        Buat pesanan cuci baru untuk mobil, motor, atau karpet sesuai jadwal kamu.
      </p>
      <button
        onClick={onOpen}
        className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition"
      >
        Pesan Sekarang
      </button>
    </div>
  );
}

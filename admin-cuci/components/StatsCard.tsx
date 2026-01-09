type Props = {
  title: string;
  value: string;
  hint?: string;
};

export default function StatsCard({ title, value, hint }: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">{title}</p>
      <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{value}</p>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

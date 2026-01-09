type Props = {
  title: string;
  description: string;
  cta?: React.ReactNode;
};

export default function Hero({ title, description, cta }: Props) {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8 mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50 mb-3">
        {title}
      </h1>
      <p className="text-slate-600 dark:text-slate-300 mb-4 max-w-2xl">{description}</p>
      {cta}
    </section>
  );
}

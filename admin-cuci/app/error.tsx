'use client';

export default function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="text-center py-16">
      <h1 className="text-2xl font-bold mb-2">Terjadi kesalahan</h1>
      <p className="text-slate-600">{error.message}</p>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Hero from '../components/Hero';
import OrderCard from '../components/OrderCard';
import QueueButton from '../components/QueueButton';
import OrderModal from '../components/modals/OrderModal';
import MyQueueModal from '../components/modals/MyQueueModal';
import AuthPromptModal from '../components/modals/AuthPromptModal';
import { useAuth } from '../components/providers/AuthProvider';

export default function HomeDashboardPage() {
  const { user, isReady, token } = useAuth();
  const isAuthenticated = Boolean(token);
  const [orderOpen, setOrderOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const requireAuth = (action: () => void) => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setAuthPromptOpen(true);
      return;
    }
    action();
  };

  return (
    <div className="space-y-6">
      <Hero
        title={`Dashboard Laundry Service${user ? `, ${user.name}` : ''}`}
        description="Kelola pesanan cuci kendaraan dan lihat antrian secara realtime."
      />

      <div className="grid md:grid-cols-2 gap-4">
        <OrderCard onOpen={() => requireAuth(() => setOrderOpen(true))} />
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Antrian</h2>
            <p className="text-slate-600 mb-4">
              Pantau posisi antrian layanan cuci mobil, motor, dan karpet.
            </p>
          </div>
          <QueueButton onOpen={() => requireAuth(() => setQueueOpen(true))} />
        </div>
      </div>

      <section className="grid md:grid-cols-3 gap-4">
        {[
          { title: 'Cepat', desc: 'Pesan cuci dalam hitungan detik, tanpa ribet.' },
          { title: 'Terpantau', desc: 'Lihat antrian dan estimasi waktu selesai.' },
          { title: 'Aman', desc: 'Login dengan token, data pesanan tersimpan.' }
        ].map((item) => (
          <div key={item.title} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
            <p className="text-slate-600 text-sm">{item.desc}</p>
          </div>
        ))}
      </section>

      <OrderModal open={orderOpen} onClose={() => setOrderOpen(false)} />
      <MyQueueModal open={queueOpen} onClose={() => setQueueOpen(false)} />
      <AuthPromptModal
        open={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        message="Anda perlu login untuk memesan cuci atau melihat antrian."
      />
    </div>
  );
}

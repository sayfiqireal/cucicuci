'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { api } from '../../lib/apiClient';
import { OrderPayload, ServiceItem } from '../../types';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const defaultPayload: OrderPayload = {
  serviceType: 'mobil',
  scheduledAt: '',
  vehicleDetails: {
    plat: '',
    merk: '',
    warna: ''
  },
  additionalNotes: ''
};

export default function OrderModal({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<OrderPayload>(defaultPayload);
  const { data: services, isLoading: servicesLoading } = useQuery<ServiceItem[]>({
    queryKey: ['services', form.serviceType],
    queryFn: () => api.getServices(form.serviceType),
    enabled: open
  });
  const filteredServices = useMemo(
    () => services?.filter((s) => s.type === form.serviceType),
    [services, form.serviceType]
  );
  const mutation = useMutation({
    mutationFn: (payload: OrderPayload) => api.createOrder(payload),
    onSuccess: () => {
      setForm(defaultPayload);
      onSuccess?.();
      onClose();
      alert('Pesanan berhasil dibuat');
    },
    onError: (err: any) => {
      alert(err?.message || 'Gagal membuat pesanan');
    }
  });

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.serviceType) {
      alert('Pilih jenis layanan');
      return;
    }
    mutation.mutate({
      ...form,
      serviceId: form.serviceId || undefined,
      scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg p-6 relative border border-slate-200 dark:border-slate-800">
        <button
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-50">
          Buat Pesanan Cuci
        </h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-200">
              Jenis Layanan
            </label>
            <select
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2"
              value={form.serviceType}
              onChange={(e) => setForm({ ...form, serviceType: e.target.value as any })}
              required
            >
              <option value="mobil">Mobil</option>
              <option value="motor">Motor</option>
              <option value="karpet">Karpet</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-200">
              Pilih Layanan Detail (opsional)
            </label>
            <select
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2"
              value={form.serviceId || ''}
              onChange={(e) =>
                setForm({ ...form, serviceId: e.target.value ? Number(e.target.value) : undefined })
              }
              disabled={servicesLoading || !filteredServices}
            >
              <option value="">Tanpa pilih spesifik</option>
              {filteredServices?.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name} — Rp{Number(svc.price).toLocaleString('id-ID')} ({svc.durationEstimate}m)
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Sesuaikan serviceType untuk memfilter layanan.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-200">
              Jadwalkan (opsional)
            </label>
            <input
              type="datetime-local"
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2"
              value={form.scheduledAt || ''}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-200">
                Plat
              </label>
              <input
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2"
                value={form.vehicleDetails?.plat || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    vehicleDetails: { ...form.vehicleDetails, plat: e.target.value }
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-200">
                Merk
              </label>
              <input
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2"
                value={form.vehicleDetails?.merk || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    vehicleDetails: { ...form.vehicleDetails, merk: e.target.value }
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-200">
                Warna
              </label>
              <input
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2"
                value={form.vehicleDetails?.warna || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    vehicleDetails: { ...form.vehicleDetails, warna: e.target.value }
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-200">
              Catatan (opsional)
            </label>
            <textarea
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2"
              rows={3}
              value={form.additionalNotes || ''}
              onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-60"
          >
            {mutation.isPending ? 'Membuat pesanan...' : 'Submit Pesanan'}
          </button>
        </form>
      </div>
    </div>
  );
}

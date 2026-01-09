import { AdminLoginResponse, AdminQueueItem, AdminOrderItem, AdminUserItem, AdminSummary } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>) || {}
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error?.message || 'Terjadi kesalahan';
    if (res.status === 401 && typeof window !== 'undefined') {
      alert('Token sudah expired, silakan login kembali.');
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    throw new Error(message);
  }
  const payload = data?.data ?? data;
  if (data?.pagination) {
    return { data: payload, pagination: data.pagination } as T;
  }
  return payload as T;
}

export const adminApi = {
  login: (payload: { email: string; password: string }) =>
    request<AdminLoginResponse>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  summary: () => request<AdminSummary>('/admin/stats/summary'),
  queue: () => request<AdminQueueItem[]>('/admin/queue'),
  orders: (params?: string) =>
    request<{ data: AdminOrderItem[]; pagination: any }>(
      '/admin/orders' + (params ? `?${params}` : '')
    ),
  users: (params?: string) =>
    request<{ data: AdminUserItem[]; pagination: any }>('/admin/users' + (params ? `?${params}` : '')),
  updateOrderStatus: (id: number, status: 'pending' | 'queued' | 'in_progress' | 'completed' | 'cancelled') =>
    request(`/admin/orders/${id}/update-status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    })
};

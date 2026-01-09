import { AuthResponse, QueueItem, OrderPayload, ServiceItem } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error?.message || 'Terjadi kesalahan';
    throw new Error(message);
  }
  return data?.data ?? data;
}

export const api = {
  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  register: (payload: { name: string; email: string; password: string }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  createOrder: (payload: OrderPayload) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getQueue: () => request<QueueItem[]>('/queue'),
  getMyQueue: () =>
    request<Array<{ orderId: number; serviceType: string; position: number; aheadCount: number; status: string }>>(
      '/queue/me'
    ),
  getServices: (type?: 'mobil' | 'motor' | 'karpet') =>
    request<ServiceItem[]>('/services' + (type ? `?type=${type}` : '')),
  cancelOrder: (orderId: number) =>
    request(`/orders/${orderId}/cancel`, {
      method: 'POST'
    })
};

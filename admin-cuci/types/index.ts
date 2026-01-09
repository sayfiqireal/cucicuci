export type Admin = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type AdminLoginResponse = {
  accessToken: string;
  admin: Admin;
};

export type AdminSummary = {
  monthlyRevenue: number;
  currency: string;
  queueCount: number;
  usersCount: number;
};

export type AdminQueueItem = {
  id?: number;
  orderId?: number;
  position: number | null;
  userName: string;
  serviceType: 'mobil' | 'motor' | 'karpet';
  etaMinutes?: number;
  status: 'pending' | 'queued' | 'in_progress' | 'completed' | 'cancelled';
  createdAt?: string | null;
};

export type AdminOrderItem = {
  id: number;
  userName: string;
  userEmail: string;
  serviceType: 'mobil' | 'motor' | 'karpet';
  status: 'pending' | 'queued' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
  createdAt: string;
  completedAt?: string | null;
};

export type AdminUserItem = {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  totalOrders?: number;
};

export type Role = 'user' | 'admin';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
};

export type OrderPayload = {
  serviceType: 'mobil' | 'motor' | 'karpet';
  serviceId?: number;
  scheduledAt?: string;
  vehicleDetails?: {
    plat?: string;
    merk?: string;
    warna?: string;
  };
  additionalNotes?: string;
};

export type QueueItem = {
  orderId: number;
  userName: string;
  position: number;
  etaMinutes?: number;
  serviceType: 'mobil' | 'motor' | 'karpet';
};

export * from './service';

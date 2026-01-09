export const DEFAULT_SERVICE_PRICES: Record<'mobil' | 'motor' | 'karpet', number> = {
  mobil: 60000,
  motor: 30000,
  karpet: 80000
};

export const DEFAULT_DURATION_MINUTES: Record<'mobil' | 'motor' | 'karpet', number> = {
  mobil: 45,
  motor: 30,
  karpet: 60
};

export const ORDER_STATUSES = ['pending', 'queued', 'in_progress', 'completed', 'cancelled'] as const;

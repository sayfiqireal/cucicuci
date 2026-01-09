import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const adminListOrdersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['pending', 'queued', 'in_progress', 'completed', 'cancelled']).optional(),
  serviceType: z.enum(['mobil', 'motor', 'karpet']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  sort: z.enum(['createdAt']).optional(),
  order: z.enum(['asc', 'desc']).optional()
});

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'queued', 'in_progress', 'completed', 'cancelled'])
});

export const adminUsersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional()
});

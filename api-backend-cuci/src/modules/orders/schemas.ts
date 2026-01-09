import { z } from 'zod';

export const createOrderSchema = z.object({
  serviceType: z.enum(['mobil', 'motor', 'karpet']),
  serviceId: z.number().int().positive().optional(),
  scheduledAt: z.string().datetime().optional(),
  additionalNotes: z.string().max(500).optional(),
  description: z.string().max(500).optional(),
  vehicleDetails: z
    .object({
      plat: z.string().optional(),
      merk: z.string().optional(),
      warna: z.string().optional(),
      model: z.string().optional(),
      catatan: z.string().optional()
    })
    .optional()
});

export const listOrderQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['pending', 'queued', 'in_progress', 'completed', 'cancelled']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional()
});

export const queueQuerySchema = z.object({
  serviceType: z.enum(['mobil', 'motor', 'karpet']).optional()
});

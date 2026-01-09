import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { listServices } from './service';
import { successResponse } from '../../utils/response';
import { requireRole } from '../../middleware/authorize';

const listQuerySchema = z.object({
  type: z.enum(['mobil', 'motor', 'karpet']).optional()
});

export async function serviceRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/',
    { preHandler: [fastify.authenticate, requireRole(['user', 'admin'])] },
    async (request, reply) => {
      const query = listQuerySchema.parse(request.query);
      const services = await listServices(fastify, query.type);
      return reply.send(successResponse(services));
    }
  );
}

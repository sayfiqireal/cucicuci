import { FastifyInstance } from 'fastify';
import { requireRole } from '../../middleware/authorize';
import { successResponse } from '../../utils/response';
import { refreshSchema } from '../auth/schemas';
import {
  adminLoginSchema,
  adminListOrdersQuerySchema,
  adminUsersQuerySchema,
  updateStatusSchema
} from './schemas';
import {
  adminLogin,
  adminLogout,
  adminRefresh,
  getAdminQueue,
  getCounts,
  getSummary,
  getOrderDetail,
  getRevenueThisMonth,
  listOrders,
  listUsers,
  updateOrderStatus
} from './service';

export async function adminRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/login', async (request, reply) => {
    const body = adminLoginSchema.parse(request.body);
    const result = await adminLogin(fastify, body);
    return reply.send(successResponse(result));
  });

  fastify.post('/auth/refresh', async (request, reply) => {
    const body = refreshSchema.parse(request.body);
    const result = await adminRefresh(fastify, body.refreshToken);
    return reply.send(successResponse(result));
  });

  fastify.post(
    '/logout',
    { preHandler: [fastify.authenticate, requireRole(['admin'])] },
    async (request, reply) => {
      const body = refreshSchema.parse(request.body);
      const result = await adminLogout(fastify, body.refreshToken);
      return reply.send(successResponse(result));
    }
  );

  fastify.get(
    '/stats/counts',
    { preHandler: [fastify.authenticate, requireRole(['admin'])] },
    async (_request, reply) => {
      const result = await getCounts(fastify);
      return reply.send(successResponse(result));
    }
  );

  fastify.get(
    '/stats/summary',
    { preHandler: [fastify.authenticate, requireRole(['admin'])] },
    async (_request, reply) => {
      const result = await getSummary(fastify);
      return reply.send(successResponse(result));
    }
  );

  fastify.get(
    '/orders',
    { preHandler: [fastify.authenticate, requireRole(['admin'])] },
    async (request, reply) => {
      const query = adminListOrdersQuerySchema.parse(request.query);
      const result = await listOrders(fastify, query);
      return reply.send(successResponse(result.data, { pagination: result.pagination }));
    }
  );

  fastify.get(
    '/orders/:id',
    { preHandler: [fastify.authenticate, requireRole(['admin'])] },
    async (request, reply) => {
      const id = Number((request.params as any).id);
      const result = await getOrderDetail(fastify, id);
      return reply.send(successResponse(result));
    }
  );

  fastify.get(
    '/revenue/month',
    { preHandler: [fastify.authenticate, requireRole(['admin'])] },
    async (_request, reply) => {
      const result = await getRevenueThisMonth(fastify);
      return reply.send(successResponse(result));
    }
  );

  fastify.get(
    '/queue',
    { preHandler: [fastify.authenticate, requireRole(['admin'])] },
    async (_request, reply) => {
      const result = await getAdminQueue(fastify);
      return reply.send(successResponse(result));
    }
  );

  fastify.get(
    '/users',
    { preHandler: [fastify.authenticate, requireRole(['admin'])] },
    async (request, reply) => {
      const query = adminUsersQuerySchema.parse(request.query);
      const result = await listUsers(fastify, query);
      return reply.send(successResponse(result.data, { pagination: result.pagination }));
    }
  );

  fastify.post(
    '/orders/:id/update-status',
    { preHandler: [fastify.authenticate, requireRole(['admin'])] },
    async (request, reply) => {
      const id = Number((request.params as any).id);
      const body = updateStatusSchema.parse(request.body);
      const result = await updateOrderStatus(fastify, id, body.status);
      return reply.send(successResponse(result));
    }
  );
}

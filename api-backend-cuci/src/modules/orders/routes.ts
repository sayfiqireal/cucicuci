import { FastifyInstance } from 'fastify';
import { requireRole } from '../../middleware/authorize';
import { successResponse } from '../../utils/response';
import { createOrderSchema, listOrderQuerySchema, queueQuerySchema } from './schemas';
import {
  cancelUserOrder,
  createOrder,
  getQueue,
  getUserOrderById,
  getUserQueuePositions,
  listUserOrders
} from './service';

export async function orderRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/',
    { preHandler: [fastify.authenticate, requireRole(['user'])] },
    async (request, reply) => {
      const body = createOrderSchema.parse(request.body);
      const order = await createOrder(fastify, request.user!.id, body);
      return reply.status(201).send(successResponse(order));
    }
  );

  fastify.get(
    '/',
    { preHandler: [fastify.authenticate, requireRole(['user'])] },
    async (request, reply) => {
      const query = listOrderQuerySchema.parse(request.query);
      const result = await listUserOrders(fastify, request.user!.id, query);
      return reply.send(successResponse(result.data, { pagination: result.pagination }));
    }
  );

  fastify.get(
    '/:id',
    { preHandler: [fastify.authenticate, requireRole(['user'])] },
    async (request, reply) => {
      const id = Number((request.params as any).id);
      const order = await getUserOrderById(fastify, request.user!.id, id);
      return reply.send(successResponse(order));
    }
  );
}

export async function queueRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/',
    { preHandler: [fastify.authenticate, requireRole(['user', 'admin'])] },
    async (request, reply) => {
      const query = queueQuerySchema.parse(request.query);
      const queue = await getQueue(fastify, query.serviceType);
      return reply.send(successResponse(queue));
    }
  );

  fastify.get(
    '/me',
    { preHandler: [fastify.authenticate, requireRole(['user'])] },
    async (request, reply) => {
      const queue = await getUserQueuePositions(fastify, request.user!.id);
      return reply.send(successResponse(queue));
    }
  );

  fastify.post(
    '/:id/cancel',
    { preHandler: [fastify.authenticate, requireRole(['user'])] },
    async (request, reply) => {
      const id = Number((request.params as any).id);
      const result = await cancelUserOrder(fastify, request.user!.id, id);
      return reply.send(successResponse(result));
    }
  );
}

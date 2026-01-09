import { FastifyInstance } from 'fastify';
import { successResponse } from '../../utils/response';
import { loginAdmin, loginUser, logoutUser, refreshTokens, registerUser } from './service';
import { loginSchema, refreshSchema, registerSchema } from './schemas';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const result = await registerUser(fastify, body);
    return reply.status(201).send(successResponse(result));
  });

  fastify.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const result = await loginUser(fastify, body);
    return reply.send(successResponse(result));
  });

  fastify.post('/refresh', async (request, reply) => {
    const body = refreshSchema.parse(request.body);
    const result = await refreshTokens(fastify, body.refreshToken);
    return reply.send(successResponse(result));
  });

  fastify.post(
    '/logout',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const body = refreshSchema.parse(request.body);
      const result = await logoutUser(fastify, body.refreshToken);
      return reply.send(successResponse(result));
    }
  );

  fastify.post('/admin/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const result = await loginAdmin(fastify, body);
    return reply.send(successResponse(result));
  });
}

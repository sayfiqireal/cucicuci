import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { config } from '../config/env';
import { errorResponse } from '../utils/response';
import { errorCodes } from '../errors/appError';

export default fp(async (fastify) => {
  fastify.register(fastifyJwt, {
    secret: config.jwtSecret
  });

  fastify.decorate('authenticate', async function (request: any, reply: any) {
    try {
      const user = await request.jwtVerify();
      request.user = user;
    } catch (err) {
      return reply
        .status(401)
        .send(errorResponse(errorCodes.UNAUTHORIZED, 'Token tidak valid atau kedaluwarsa'));
    }
  });
});

import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/env';

export const prisma = new PrismaClient({
  log: config.env === 'development' ? ['query', 'info', 'warn', 'error'] : ['error', 'warn']
});

export default fp(async (fastify) => {
  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async () => {
    await fastify.prisma.$disconnect();
  });
});

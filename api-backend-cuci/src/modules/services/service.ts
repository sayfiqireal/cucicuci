import { FastifyInstance } from 'fastify';

export const listServices = async (
  fastify: FastifyInstance,
  serviceType?: 'mobil' | 'motor' | 'karpet'
) => {
  return fastify.prisma.service.findMany({
    where: serviceType ? { type: serviceType } : undefined,
    orderBy: { createdAt: 'asc' }
  });
};

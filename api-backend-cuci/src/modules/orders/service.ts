import { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import { DEFAULT_SERVICE_PRICES } from '../../config/constants';
import { AppError, errorCodes } from '../../errors/appError';
import { buildPagination, getPaginationParams } from '../../utils/pagination';
import { calculateEtaList } from '../../utils/queue';

export const createOrder = async (
  fastify: FastifyInstance,
  userId: number,
  payload: {
    serviceType: 'mobil' | 'motor' | 'karpet';
    serviceId?: number;
    scheduledAt?: string;
    additionalNotes?: string;
    vehicleDetails?: Record<string, unknown>;
  }
) => {
  const service = payload.serviceId
    ? await fastify.prisma.service.findUnique({ where: { id: payload.serviceId } })
    : null;

  if (service && service.type !== payload.serviceType) {
    throw new AppError(400, errorCodes.VALIDATION_FAILED, 'serviceId tidak sesuai dengan serviceType');
  }

  const price = Number(service?.price || DEFAULT_SERVICE_PRICES[payload.serviceType]);
  const scheduledAtDate = payload.scheduledAt ? new Date(payload.scheduledAt) : undefined;

  const created = await fastify.prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId,
        serviceType: payload.serviceType,
        serviceId: payload.serviceId,
        scheduledAt: scheduledAtDate,
        status: 'queued',
        price,
        notes: payload.additionalNotes || (payload as any).description,
        vehicleDetails: payload.vehicleDetails
          ? (payload.vehicleDetails as Prisma.InputJsonValue)
          : undefined
      },
      include: {
        service: true
      }
    });

    const position = await getNextQueuePosition(tx, payload.serviceType);
    const queue = await tx.queuePosition.create({
      data: {
        orderId: order.id,
        position
      }
    });

    return { ...order, queuePosition: queue };
  });

  return created;
};

const getNextQueuePosition = async (
  tx: Prisma.TransactionClient,
  serviceType: 'mobil' | 'motor' | 'karpet'
) => {
  const last = await tx.queuePosition.findFirst({
    where: {
      order: {
        serviceType,
        status: { in: ['queued', 'in_progress'] }
      }
    },
    orderBy: { position: 'desc' }
  });
  return (last?.position || 0) + 1;
};

export const listUserOrders = async (
  fastify: FastifyInstance,
  userId: number,
  query: { page?: string; limit?: string; status?: string; from?: string; to?: string }
) => {
  const { page, limit, skip } = getPaginationParams(query.page, query.limit);
  const where: any = { userId };
  if (query.status) where.status = query.status;
  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt.gte = new Date(query.from);
    if (query.to) where.createdAt.lte = new Date(query.to);
  }

  const [items, total] = await Promise.all([
    fastify.prisma.order.findMany({
      where,
      include: { service: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    fastify.prisma.order.count({ where })
  ]);

  return {
    data: items,
    pagination: buildPagination(page, limit, total)
  };
};

export const getUserOrderById = async (fastify: FastifyInstance, userId: number, id: number) => {
  const order = await fastify.prisma.order.findFirst({
    where: { id, userId },
    include: { service: true, user: true, queuePosition: true, payment: true }
  });
  if (!order) throw new AppError(404, errorCodes.NOT_FOUND, 'Order tidak ditemukan');
  return order;
};

export const getQueue = async (
  fastify: FastifyInstance,
  serviceType?: 'mobil' | 'motor' | 'karpet'
) => {
  const queue = await fastify.prisma.queuePosition.findMany({
    where: {
      order: {
        ...(serviceType ? { serviceType } : {}),
        status: { in: ['pending', 'queued', 'in_progress'] }
      }
    },
    include: {
      order: {
        include: {
          user: true,
          service: true
        }
      }
    },
    orderBy: { position: 'asc' }
  });

  const etaList = calculateEtaList(
    queue.map((item) => ({
      serviceType: item.order.serviceType as 'mobil' | 'motor' | 'karpet',
      service: item.order.service || undefined
    }))
  );

  return queue.map((item, idx) => ({
    orderId: item.orderId,
    userName: item.order.user.name,
    position: item.position,
    etaMinutes: etaList[idx],
    serviceType: item.order.serviceType,
    status: item.order.status
  }));
};

export const getUserQueuePositions = async (fastify: FastifyInstance, userId: number) => {
  const myQueue = await fastify.prisma.queuePosition.findMany({
    where: {
      order: {
        userId,
        status: { in: ['queued', 'in_progress'] }
      }
    },
    include: {
      order: true
    },
    orderBy: { position: 'asc' }
  });

  const results = await Promise.all(
    myQueue.map(async (item) => {
      const ahead = await fastify.prisma.queuePosition.count({
        where: {
          order: {
            serviceType: item.order.serviceType,
            status: { in: ['queued', 'in_progress'] }
          },
          position: { lt: item.position }
        }
      });
      return {
        orderId: item.orderId,
        serviceType: item.order.serviceType,
        position: item.position,
        aheadCount: ahead,
        status: item.order.status
      };
    })
  );

  return results;
};

export const cancelUserOrder = async (fastify: FastifyInstance, userId: number, orderId: number) => {
  const order = await fastify.prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { queuePosition: true }
  });
  if (!order) throw new AppError(404, errorCodes.NOT_FOUND, 'Order tidak ditemukan');
  if (order.status !== 'queued') {
    throw new AppError(400, errorCodes.VALIDATION_FAILED, 'Order tidak bisa dibatalkan');
  }

  await fastify.prisma.$transaction(async (tx) => {
    if (order.queuePosition) {
      await tx.queuePosition.delete({ where: { id: order.queuePosition.id } });
      await resequenceQueue(tx, order.serviceType);
    }

    await tx.order.update({
      where: { id: order.id },
      data: { status: 'cancelled' }
    });
  });

  return { message: 'Order dibatalkan' };
};

const resequenceQueue = async (tx: Prisma.TransactionClient, serviceType: 'mobil' | 'motor' | 'karpet') => {
  const items = await tx.queuePosition.findMany({
    where: { order: { serviceType, status: { in: ['queued', 'in_progress'] } } },
    orderBy: { position: 'asc' }
  });
  for (let i = 0; i < items.length; i++) {
    if (items[i].position !== i + 1) {
      await tx.queuePosition.update({
        where: { id: items[i].id },
        data: { position: i + 1 }
      });
    }
  }
};

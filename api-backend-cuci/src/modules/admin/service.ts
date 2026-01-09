import { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import { AppError, errorCodes } from '../../errors/appError';
import { buildPagination, getPaginationParams } from '../../utils/pagination';
import { calculateEtaList } from '../../utils/queue';
import { loginAdmin, logoutUser, refreshTokens } from '../auth/service';

export const adminLogin = loginAdmin;
export const adminRefresh = refreshTokens;
export const adminLogout = logoutUser;

export const getCounts = async (fastify: FastifyInstance) => {
  const counts = await fastify.prisma.order.groupBy({
    by: ['serviceType'],
    _count: { _all: true }
  });
  const map: Record<string, number> = { mobil: 0, motor: 0, karpet: 0 };
  counts.forEach((c) => {
    map[c.serviceType] = c._count._all;
  });
  return {
    mobil: map.mobil,
    motor: map.motor,
    karpet: map.karpet,
    total: map.mobil + map.motor + map.karpet
  };
};

export const getSummary = async (fastify: FastifyInstance) => {
  const [revenue, queueCount, usersCount] = await Promise.all([
    getRevenueThisMonth(fastify),
    fastify.prisma.queuePosition.count({
      where: { order: { status: { in: ['queued', 'in_progress'] } } }
    }),
    fastify.prisma.user.count()
  ]);
  return {
    monthlyRevenue: revenue.totalRevenue,
    currency: 'IDR',
    queueCount,
    usersCount
  };
};

export const listOrders = async (
  fastify: FastifyInstance,
  query: {
    page?: string;
    limit?: string;
    status?: 'pending' | 'queued' | 'in_progress' | 'completed' | 'cancelled';
    serviceType?: 'mobil' | 'motor' | 'karpet';
    from?: string;
    to?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }
) => {
  const { page, limit, skip } = getPaginationParams(query.page, query.limit);
  const where: any = {};
  if (query.status) where.status = query.status;
  if (query.serviceType) where.serviceType = query.serviceType;
  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt.gte = new Date(query.from);
    if (query.to) where.createdAt.lte = new Date(query.to);
  }
  const orderBy = { [query.sort || 'createdAt']: query.order || 'desc' };

  const [items, total] = await Promise.all([
    fastify.prisma.order.findMany({
      where,
      include: { user: true, service: true, payment: true, queuePosition: true },
      orderBy,
      skip,
      take: limit
    }),
    fastify.prisma.order.count({ where })
  ]);

  const mapped = items.map((o) => ({
    id: o.id,
    userName: o.user?.name || 'Unknown',
    userEmail: o.user?.email || '-',
    serviceType: o.serviceType,
    status: o.status,
    price: Number(o.price),
    createdAt: o.createdAt,
    completedAt: o.completedAt
  }));

  return { data: mapped, pagination: buildPagination(page, limit, total) };
};

export const getOrderDetail = async (fastify: FastifyInstance, id: number) => {
  const order = await fastify.prisma.order.findUnique({
    where: { id },
    include: { user: true, service: true, payment: true, queuePosition: true }
  });
  if (!order) throw new AppError(404, errorCodes.NOT_FOUND, 'Order tidak ditemukan');
  return order;
};

export const getRevenueThisMonth = async (fastify: FastifyInstance) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const result = await fastify.prisma.order.aggregate({
    _sum: { price: true },
    where: {
      status: 'completed',
      completedAt: {
        gte: start,
        lt: end
      }
    }
  });
  return {
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    totalRevenue: Number(result._sum.price || 0),
    currency: 'IDR'
  };
};

export const getAdminQueue = async (fastify: FastifyInstance) => {
  const orders = await fastify.prisma.order.findMany({
    where: { status: { in: ['pending', 'queued', 'in_progress'] } },
    include: { queuePosition: true, user: true, service: true }
  });

  const queued = orders
    .filter((o) => o.queuePosition)
    .sort((a, b) => (a.queuePosition!.position || 0) - (b.queuePosition!.position || 0));
  const etaList = calculateEtaList(
    queued.map((item) => ({
      serviceType: item.serviceType as 'mobil' | 'motor' | 'karpet',
      service: item.service || undefined
    }))
  );
  const etaMap = new Map<number, number>();
  queued.forEach((item, idx) => etaMap.set(item.id, etaList[idx]));

  const sorted = orders.sort((a, b) => {
    const pa = a.queuePosition?.position ?? Number.MAX_SAFE_INTEGER;
    const pb = b.queuePosition?.position ?? Number.MAX_SAFE_INTEGER;
    if (pa !== pb) return pa - pb;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  return sorted.map((item) => ({
    orderId: item.id,
    userName: item.user?.name || 'Unknown',
    position: item.queuePosition?.position ?? null,
    etaMinutes: etaMap.get(item.id),
    serviceType: item.serviceType,
    status: item.status,
    createdAt: item.createdAt
  }));
};

export const updateOrderStatus = async (
  fastify: FastifyInstance,
  id: number,
  status: 'pending' | 'queued' | 'in_progress' | 'completed' | 'cancelled'
) => {
  const order = await fastify.prisma.order.findUnique({
    where: { id },
    include: { queuePosition: true }
  });
  if (!order) throw new AppError(404, errorCodes.NOT_FOUND, 'Order tidak ditemukan');

  const updated = await fastify.prisma.$transaction(async (tx) => {
    if (status === 'queued' && !order.queuePosition) {
      const position = await tx.queuePosition.findFirst({
        where: { order: { serviceType: order.serviceType, status: { in: ['queued', 'in_progress'] } } },
        orderBy: { position: 'desc' }
      });
      await tx.queuePosition.create({
        data: {
          orderId: order.id,
          position: (position?.position || 0) + 1
        }
      });
    }

    if (status !== 'queued' && order.queuePosition) {
      await tx.queuePosition.delete({ where: { id: order.queuePosition.id } });
      await resequenceQueue(tx, order.serviceType as 'mobil' | 'motor' | 'karpet');
    }

    const updatedOrder = await tx.order.update({
      where: { id },
      data: {
        status,
        completedAt: status === 'completed' ? new Date() : order.completedAt
      },
      include: { user: true, service: true, payment: true, queuePosition: true }
    });

    return updatedOrder;
  });

  return updated;
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

export const listUsers = async (
  fastify: FastifyInstance,
  query: { page?: string; limit?: string; search?: string }
) => {
  const { page, limit, skip } = getPaginationParams(query.page, query.limit);
  const where: any = {};
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } }
    ];
  }

  const [items, total] = await Promise.all([
    fastify.prisma.user.findMany({
      where,
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    fastify.prisma.user.count({ where })
  ]);

  const data = items.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    totalOrders: u._count.orders
  }));

  return { data, pagination: buildPagination(page, limit, total) };
};

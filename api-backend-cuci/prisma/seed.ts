import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

export const runSeed = async (options?: { disconnect?: boolean }) => {
  console.info('Seeding database...');
  await prisma.refreshToken.deleteMany();
  await prisma.queuePosition.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await hashPassword('admin123');
  const userPassword = await hashPassword('password123');

  const admin = await prisma.user.create({
    data: {
      name: 'Admin Cuci',
      email: 'admin@laundry.com',
      passwordHash: adminPassword,
      role: 'admin'
    }
  });

  const users = await prisma.user.createMany({
    data: [
      {
        name: 'Budi',
        email: 'budi@example.com',
        passwordHash: userPassword,
        role: 'user'
      },
      {
        name: 'Sari',
        email: 'sari@example.com',
        passwordHash: userPassword,
        role: 'user'
      },
      {
        name: 'Andi',
        email: 'andi@example.com',
        passwordHash: userPassword,
        role: 'user'
      }
    ]
  });

  console.info('Users created', { admin: admin.email, count: users.count });

  const services = await prisma.service.createMany({
    data: [
      { name: 'Cuci Mobil Standard', type: 'mobil', price: 80000, durationEstimate: 60 },
      { name: 'Cuci Mobil Premium', type: 'mobil', price: 120000, durationEstimate: 80 },
      { name: 'Cuci Motor Reguler', type: 'motor', price: 30000, durationEstimate: 30 },
      { name: 'Cuci Motor Detailing', type: 'motor', price: 60000, durationEstimate: 50 },
      { name: 'Cuci Karpet Vacuum', type: 'karpet', price: 90000, durationEstimate: 70 },
      { name: 'Cuci Karpet Deep Clean', type: 'karpet', price: 150000, durationEstimate: 120 }
    ]
  });
  console.info('Services created', services.count);

  const serviceList = await prisma.service.findMany();
  const usersList = await prisma.user.findMany({ where: { role: 'user' }, orderBy: { id: 'asc' } });

  const ordersData = [
    {
      user: usersList[0],
      service: serviceList.find((s) => s.name === 'Cuci Mobil Standard')!,
      status: 'queued',
      price: 80000,
      scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
      notes: 'Perlu ekstra vacuum'
    },
    {
      user: usersList[0],
      service: serviceList.find((s) => s.name === 'Cuci Motor Reguler')!,
      status: 'in_progress',
      price: 30000
    },
    {
      user: usersList[1],
      service: serviceList.find((s) => s.name === 'Cuci Mobil Premium')!,
      status: 'completed',
      price: 120000,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      notes: 'Ada noda aspal di pintu'
    },
    {
      user: usersList[1],
      service: serviceList.find((s) => s.name === 'Cuci Karpet Deep Clean')!,
      status: 'queued',
      price: 150000
    },
    {
      user: usersList[2],
      service: serviceList.find((s) => s.name === 'Cuci Motor Detailing')!,
      status: 'completed',
      price: 60000,
      completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      user: usersList[2],
      service: serviceList.find((s) => s.name === 'Cuci Karpet Vacuum')!,
      status: 'cancelled',
      price: 90000
    },
    {
      user: usersList[0],
      service: serviceList.find((s) => s.name === 'Cuci Mobil Premium')!,
      status: 'pending',
      price: 120000
    },
    {
      user: usersList[1],
      service: serviceList.find((s) => s.name === 'Cuci Motor Reguler')!,
      status: 'queued',
      price: 30000
    },
    {
      user: usersList[1],
      service: serviceList.find((s) => s.name === 'Cuci Mobil Standard')!,
      status: 'completed',
      price: 80000,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      user: usersList[2],
      service: serviceList.find((s) => s.name === 'Cuci Karpet Vacuum')!,
      status: 'queued',
      price: 90000
    }
  ];

  const ordersCreated = [];
  for (const data of ordersData) {
    const order = await prisma.order.create({
      data: {
        userId: data.user.id,
        serviceId: data.service.id,
        serviceType: data.service.type,
        status: data.status as any,
        price: data.price,
        scheduledAt: data.scheduledAt,
        completedAt: data.completedAt,
        notes: data.notes,
        vehicleDetails:
          data.service.type !== 'karpet'
            ? {
                plat: 'B' + Math.floor(Math.random() * 9000 + 1000),
                warna: 'Hitam'
              }
            : { ukuran: '2x3' }
      }
    });
    ordersCreated.push(order);
  }

  const positionMap: Record<'mobil' | 'motor' | 'karpet', number> = { mobil: 0, motor: 0, karpet: 0 };
  for (const order of ordersCreated) {
    if (order.status === 'queued' || order.status === 'in_progress') {
      positionMap[order.serviceType as 'mobil' | 'motor' | 'karpet'] += 1;
      await prisma.queuePosition.create({
        data: {
          orderId: order.id,
          position: positionMap[order.serviceType as 'mobil' | 'motor' | 'karpet']
        }
      });
    }
    if (order.status === 'completed') {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: order.price,
          method: 'cash',
          status: 'paid',
          paidAt: order.completedAt || new Date()
        }
      });
    }
  }

  console.info('Seed selesai');
  if (options?.disconnect) {
    await prisma.$disconnect();
  }
};

if (require.main === module) {
  runSeed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

import request from 'supertest';
import { buildApp } from '../../src/app';
import { runSeed } from '../../prisma/seed';

jest.setTimeout(30000);

describe('Auth and Orders integration', () => {
  let app: ReturnType<typeof buildApp>;
  let userToken = '';

  beforeAll(async () => {
    await runSeed({ disconnect: true });
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a new user', async () => {
    const email = `user${Date.now()}@example.com`;
    const res = await request(app.server).post('/auth/register').send({
      name: 'Tester',
      email,
      password: 'password123'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(email.toLowerCase());
  });

  it('logs in seeded user and returns token', async () => {
    const res = await request(app.server).post('/auth/login').send({
      email: 'budi@example.com',
      password: 'password123'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    userToken = res.body.data.accessToken;
  });

  it('creates an order and lists it', async () => {
    const createRes = await request(app.server)
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        serviceType: 'mobil',
        scheduledAt: new Date().toISOString(),
        vehicleDetails: { plat: 'B1234CD' }
      });

    expect(createRes.statusCode).toBe(201);
    const orderId = createRes.body.data.id;

    const listRes = await request(app.server)
      .get('/orders')
      .set('Authorization', `Bearer ${userToken}`);

    expect(listRes.statusCode).toBe(200);
    const found = listRes.body.data.find((o: any) => o.id === orderId);
    expect(found).toBeDefined();
  });
});

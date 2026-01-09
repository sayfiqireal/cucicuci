import request from 'supertest';
import { buildApp } from '../../src/app';
import { runSeed } from '../../prisma/seed';

jest.setTimeout(30000);

describe('Admin endpoints', () => {
  let app: ReturnType<typeof buildApp>;
  let adminToken = '';

  beforeAll(async () => {
    await runSeed({ disconnect: true });
    app = buildApp();
    await app.ready();
    const login = await request(app.server).post('/admin/auth/login').send({
      email: 'admin@laundry.com',
      password: 'admin123'
    });
    adminToken = login.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists orders with pagination', async () => {
    const res = await request(app.server)
      .get('/admin/orders?page=1&limit=5')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.pagination).toBeDefined();
  });

  it('gets order detail', async () => {
    const list = await request(app.server)
      .get('/admin/orders?page=1&limit=1')
      .set('Authorization', `Bearer ${adminToken}`);
    const firstId = list.body.data[0].id;
    const detail = await request(app.server)
      .get(`/admin/orders/${firstId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(detail.statusCode).toBe(200);
    expect(detail.body.data.id).toBe(firstId);
  });
});

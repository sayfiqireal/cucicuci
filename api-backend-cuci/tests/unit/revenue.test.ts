import { getRevenueThisMonth } from '../../src/modules/admin/service';

describe('revenue calculation', () => {
  it('returns aggregated revenue for the current month', async () => {
    const fixedDate = new Date('2025-01-15T00:00:00Z');
    jest.useFakeTimers().setSystemTime(fixedDate);

    const mockPrisma = {
      order: {
        aggregate: jest.fn().mockResolvedValue({
          _sum: {
            price: 450000
          }
        })
      }
    };

    const fastifyMock: any = { prisma: mockPrisma };
    const result = await getRevenueThisMonth(fastifyMock);

    expect(mockPrisma.order.aggregate).toHaveBeenCalled();
    expect(result.month).toBe('2025-01');
    expect(result.totalRevenue).toBe(450000);
    expect(result.currency).toBe('IDR');
  });

  afterAll(() => {
    jest.useRealTimers();
  });
});

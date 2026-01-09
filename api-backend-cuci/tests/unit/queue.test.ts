import { calculateEtaList } from '../../src/utils/queue';

describe('queue ETA calculation', () => {
  it('computes cumulative ETA based on service duration', () => {
    const queue = [
      { serviceType: 'mobil' as const, service: { durationEstimate: 60 } as any },
      { serviceType: 'motor' as const, service: { durationEstimate: 30 } as any },
      { serviceType: 'karpet' as const, service: { durationEstimate: 90 } as any }
    ];

    const result = calculateEtaList(queue);
    expect(result).toEqual([60, 90, 180]);
  });
});

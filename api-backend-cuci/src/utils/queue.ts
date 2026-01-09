import { DEFAULT_DURATION_MINUTES } from '../config/constants';
import { Service } from '@prisma/client';

export const getDurationForService = (serviceType: 'mobil' | 'motor' | 'karpet', service?: Service) => {
  return service?.durationEstimate || DEFAULT_DURATION_MINUTES[serviceType];
};

export const calculateEtaList = (
  queue: Array<{
    serviceType: 'mobil' | 'motor' | 'karpet';
    service?: Service | null;
  }>
) => {
  let cumulative = 0;
  return queue.map((item) => {
    const duration = getDurationForService(item.serviceType, item.service || undefined);
    cumulative += duration;
    return cumulative;
  });
};

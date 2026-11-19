import { AnalyticsQueryDto } from '../dto/requests/analytics-query.dto.js';

export interface AnalyticsDateRange {
  startDate: Date;
  endDate: Date;
}

export function getAnalyticsDateRange(
  query: AnalyticsQueryDto,
): AnalyticsDateRange {
  if (query.startDate && query.endDate) {
    return {
      startDate: new Date(query.startDate),
      endDate: new Date(query.endDate),
    };
  }

  const endDate = new Date();
  const startDate = new Date(endDate);

  switch (String(query.period ?? '30d')) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '3m':
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case '6m':
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case '30d':
    default:
      startDate.setDate(startDate.getDate() - 30);
      break;
  }

  return { startDate, endDate };
}

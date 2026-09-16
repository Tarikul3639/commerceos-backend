import { DashboardQueryDto } from '../dto/requests/dashboard-query.dto';

export interface DashboardDateRange {
    startDate: Date;
    endDate: Date;
}

export function getDashboardDateRange(
    query: DashboardQueryDto,
): DashboardDateRange {
    // Use custom date range if both dates are provided
    if (query.startDate && query.endDate) {
        return {
            startDate: new Date(query.startDate),
            endDate: new Date(query.endDate),
        };
    }

    // Default end date is now
    const endDate = new Date();

    // Start date will be calculated based on selected period
    const startDate = new Date(endDate);

    switch (query.period ?? '30d') {
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

    return {
        startDate,
        endDate,
    };
}
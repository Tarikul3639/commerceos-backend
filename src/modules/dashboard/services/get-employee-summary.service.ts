import { Injectable } from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { DashboardQueryDto } from '../dto/requests/dashboard-query.dto';
import { EmployeeSummaryResponseDto } from '../dto/responses/employee-summary-response.dto';
import { getDashboardDateRange } from '../utils/dashboard-date-range.util';
import { getCreatedAtFilter } from '../utils/dashboard-where.util';

@Injectable()
export class GetEmployeeSummaryService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(query: DashboardQueryDto): Promise<EmployeeSummaryResponseDto> {
        /**
         * Get the selected dashboard date range.
         */
        const { startDate, endDate } = getDashboardDateRange(query);

        /**
         * Build the common employee filter
         * for the selected period.
         */
        const where: Prisma.EmployeeWhereInput = {
            createdAt: getCreatedAtFilter(startDate, endDate),
        };

        /**
         * Get employee statistics in parallel.
         */
        const [totalEmployees, newEmployees] = await Promise.all([
            /**
             * Count all employees.
             */
            this.prisma.employee.count(),

            /**
             * Count employees created
             * within the selected period.
             */
            this.prisma.employee.count({
                where,
            }),
        ]);

        /**
         * The Employee model does not have a status field.
         *
         * Therefore, activeEmployees is currently
         * considered equal to totalEmployees.
         */
        const activeEmployees = totalEmployees;

        /**
         * Return the employee dashboard summary.
         */
        return {
            totalEmployees,
            activeEmployees,
            newEmployees,
        };
    }
}

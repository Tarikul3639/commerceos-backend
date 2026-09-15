import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { EmployeeQueryDto } from '../dto/requests/employee-query.dto';
import { EmployeeResponseDto } from '../dto/responses/employee-response.dto';

import { PaginatedResponse } from '@/common/interfaces/paginated-response.interface';

@Injectable()
export class GetEmployeesService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        query: EmployeeQueryDto,
    ): Promise<PaginatedResponse<EmployeeResponseDto>> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;

        const skip = (page - 1) * limit;

        const where = query.search
            ? {
                OR: [
                    {
                        designation: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },
                    {
                        user: {
                            name: {
                                contains: query.search,
                                mode: 'insensitive' as const,
                            },
                        },
                    },
                    {
                        user: {
                            email: {
                                contains: query.search,
                                mode: 'insensitive' as const,
                            },
                        },
                    },
                ],
            }
            : {};

        const [employees, total] = await this.prisma.$transaction([
            this.prisma.employee.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }),

            this.prisma.employee.count({
                where,
            }),
        ]);

        const totalPages = Math.ceil(total / limit);

        const data: EmployeeResponseDto[] = employees.map((employee) => ({
            id: employee.id,
            designation: employee.designation,

            salary: employee.salary ? employee.salary.toString() : null,

            joiningDate: employee.joiningDate,
            userId: employee.userId,

            user: {
                id: employee.user.id,
                name: employee.user.name,
                email: employee.user.email,
            },

            createdAt: employee.createdAt,
            updatedAt: employee.updatedAt,
        }));

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }
}

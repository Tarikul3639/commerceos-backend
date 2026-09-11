import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { CustomerQueryDto } from '../dto/requests/customer-query.dto';
import { CustomerResponseDto } from '../dto/responses/customer-response.dto';

@Injectable()
export class GetCustomersService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async execute(
        query: CustomerQueryDto,
    ) {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = query;

        const skip = (page - 1) * limit;

        const where = {
            deletedAt: null,

            ...(status !== undefined && {
                status,
            }),

            ...(search !== undefined && {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive' as const,
                        },
                    },

                    {
                        email: {
                            contains: search,
                            mode: 'insensitive' as const,
                        },
                    },

                    {
                        phone: {
                            contains: search,
                            mode: 'insensitive' as const,
                        },
                    },
                ],
            }),
        };

        const [customers, total] =
            await this.prisma.$transaction([
                this.prisma.customer.findMany({
                    where,
                    skip,
                    take: limit,

                    orderBy: {
                        [sortBy]: sortOrder,
                    },

                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        address: true,
                        status: true,
                        isVerified: true,
                        lastLoginAt: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                }),

                this.prisma.customer.count({
                    where,
                }),
            ]);

        return {
            data: customers as CustomerResponseDto[],

            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
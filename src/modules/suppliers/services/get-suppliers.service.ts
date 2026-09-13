import { Injectable } from '@nestjs/common';

import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { SupplierQueryDto } from '../dto/requests/supplier-query.dto';
import { SupplierResponseDto } from '../dto/responses/supplier-response.dto';

import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';

@Injectable()
export class GetSuppliersService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        query: SupplierQueryDto,
    ): Promise<PaginatedResponse<SupplierResponseDto>> {
        const { page = '1', limit = '10', search, isActive } = query;

        const currentPage = Math.max(Number(page), 1);
        const pageSize = Math.min(Math.max(Number(limit), 1), 100);

        const where: Prisma.SupplierWhereInput = {
            deletedAt: null,

            ...(isActive !== undefined && {
                isActive: isActive === 'true',
            }),

            ...(search && {
                OR: [
                    {
                        name: {
                            contains: search.trim(),
                            mode: 'insensitive',
                        },
                    },

                    {
                        email: {
                            contains: search.trim(),
                            mode: 'insensitive',
                        },
                    },

                    {
                        phone: {
                            contains: search.trim(),
                            mode: 'insensitive',
                        },
                    },

                    {
                        contactPerson: {
                            contains: search.trim(),
                            mode: 'insensitive',
                        },
                    },
                ],
            }),
        };

        const [suppliers, total] = await Promise.all([
            this.prisma.supplier.findMany({
                where,
                skip: (currentPage - 1) * pageSize,
                take: pageSize,

                orderBy: {
                    createdAt: 'desc',
                },
            }),

            this.prisma.supplier.count({
                where,
            }),
        ]);

        return {
            data: suppliers.map((supplier) => ({
                id: supplier.id,
                name: supplier.name,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address,
                contactPerson: supplier.contactPerson,
                isActive: supplier.isActive,
                createdAt: supplier.createdAt,
                updatedAt: supplier.updatedAt,
            })),

            meta: {
                total,
                page: currentPage,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize),
                hasNextPage: currentPage * pageSize < total,
                hasPreviousPage: currentPage > 1,
            },
        };
    }
}

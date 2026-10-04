import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { CustomerQueryDto } from '@/modules/customers/dto/requests/customer-query.dto';
import { CustomersPaginatedResponseDto } from '@/modules/customers/dto/responses/customer-response.dto';

@Injectable()
export class GetCustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: CustomerQueryDto,
  ): Promise<CustomersPaginatedResponseDto> {
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

    const [customers, total] = await this.prisma.$transaction([
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
          avatarUrl: true,
          publicId: true,
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

    const totalPages = Math.ceil(total / limit);

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}

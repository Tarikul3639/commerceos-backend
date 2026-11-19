import { Injectable } from '@nestjs/common';

import { Prisma, Role } from '../../../infrastructure/database/generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';

import { UserQueryDto } from '../dto/requests/user-query.dto.js';
import { UserResponseDto } from '../dto/responses/user-response.dto.js';

@Injectable()
export class GetUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: UserQueryDto, requesterRole: Role) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      role,
      staffOnly = false,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const isSuperAdmin = requesterRole === Role.SUPER_ADMIN;

    const where: Prisma.UserWhereInput = {
      ...(!isSuperAdmin && {
        deletedAt: null,
        NOT: { role: Role.SUPER_ADMIN },
      }),
      ...(status && { status }),
      ...(role && { role }),
      ...(staffOnly && { role: { in: [Role.MANAGER, Role.EMPLOYEE] } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      }),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const data: UserResponseDto[] = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      publicId: user.publicId,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return {
      data,
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

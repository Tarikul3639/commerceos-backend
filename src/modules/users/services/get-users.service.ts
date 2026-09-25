import { Injectable } from '@nestjs/common';

import { Prisma, RoleName } from '../../../lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { UserQueryDto } from '../dto/requests/user-query.dto';
import { UserResponseDto } from '../dto/responses/user-response.dto';

@Injectable()
export class GetUsersService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(query: UserQueryDto, requesterRole: RoleName) {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = query;

        const skip = (page - 1) * limit;

        const isSuperAdmin = requesterRole === RoleName.SUPER_ADMIN;

        const where: Prisma.UserWhereInput = {
            ...(!isSuperAdmin && {
                deletedAt: null,
            }),

            ...(status && {
                status,
            }),

            ...(search && {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        email: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        phone: {
                            contains: search,
                        },
                    },
                ],
            }),
        };

        const [users, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,

                orderBy: {
                    [sortBy]: sortOrder,
                },

                include: {
                    role: {
                        select: {
                            name: true,
                        },
                    },
                },
            }),

            this.prisma.user.count({
                where,
            }),
        ]);

        const totalPages = Math.ceil(total / limit);

        const data: UserResponseDto[] = users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            publicId: user.publicId,

            role: user.role.name,

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

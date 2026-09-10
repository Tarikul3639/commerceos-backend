import { Injectable } from '@nestjs/common';

import { Prisma } from '../../../lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { UserQueryDto } from '../dto/requests/user-query.dto';
import { UserResponseDto } from '../dto/responses/user-response.dto';

@Injectable()
export class GetUsersService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async execute(
        query: UserQueryDto,
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

        const where: Prisma.UserWhereInput = {
            deletedAt: null,

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
            }),

            this.prisma.user.count({
                where,
            }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: users as UserResponseDto[],

            meta: {
                total,
                page,
                limit,
                totalPages,
            },
        };
    }
}
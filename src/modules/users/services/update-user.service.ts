import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { UpdateUserDto } from '../dto/requests/update-user.dto';
import { UserResponseDto } from '../dto/responses/user-response.dto';

@Injectable()
export class UpdateUserService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        userId: string,
        updateUserDto: UpdateUserDto,
    ): Promise<UserResponseDto> {
        const user = await this.prisma.user.findFirst({
            where: {
                id: userId,
                deletedAt: null,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const { name, email, phone, avatar } = updateUserDto;

        // Check email uniqueness
        if (email && email !== user.email) {
            const existingUser = await this.prisma.user.findUnique({
                where: {
                    email,
                },
            });

            if (existingUser) {
                throw new ConflictException('Email already in use');
            }
        }

        // Check phone uniqueness
        if (phone && phone !== user.phone) {
            const existingUser = await this.prisma.user.findUnique({
                where: {
                    phone,
                },
            });

            if (existingUser) {
                throw new ConflictException('Phone number already in use');
            }
        }

        const updatedUser = await this.prisma.user.update({
            where: {
                id: userId,
            },

            data: {
                ...(name !== undefined && { name }),
                ...(email !== undefined && { email }),
                ...(phone !== undefined && { phone }),
                ...(avatar !== undefined && { avatar }),
            },
        });

        return updatedUser;
    }
}

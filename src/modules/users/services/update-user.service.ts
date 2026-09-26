import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { CloudinaryService } from '../../../common/cloudinary/cloudinary.service';
import { PrismaService } from '../../../common/prisma/prisma.service';

import { UpdateUserDto } from '../dto/requests/update-user.dto';
import { UserResponseDto } from '../dto/responses/user-response.dto';

/* ============================================================================
 * SERVICE
 * ============================================================================ */

@Injectable()
export class UpdateUserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    async execute(
        userId: string,
        updateUserDto: UpdateUserDto,
    ): Promise<UserResponseDto> {
        // ------------------------------------------------------------------------
        // 1. Fetch User & Validation Checks
        // ------------------------------------------------------------------------

        const user = await this.prisma.user.findFirst({
            where: {
                id: userId,
                deletedAt: null,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        /**
         * Prevent updates to SUPER_ADMIN account.
         */
        if (user.role === 'SUPER_ADMIN') {
            throw new ConflictException('SUPER_ADMIN user cannot be updated');
        }

        const { name, email, phone, avatar, publicId, role } = updateUserDto;

        // ------------------------------------------------------------------------
        // 2. Uniqueness & Related Entity Validation
        // ------------------------------------------------------------------------

        /**
         * Check email uniqueness if modified.
         */
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

        /**
         * Check phone number uniqueness if modified.
         */
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

        /**
         * Check if the target role exists.
         */
        // ------------------------------------------------------------------------
        // 3. Avatar Handling
        // ------------------------------------------------------------------------

        const isAvatarRemoved = avatar === null;

        const isAvatarReplaced =
            publicId !== undefined &&
            publicId !== null &&
            publicId !== user.publicId;

        /**
         * Delete old avatar from Cloudinary if removed or replaced.
         */
        if ((isAvatarRemoved || isAvatarReplaced) && user.publicId) {
            await this.cloudinaryService.delete(user.publicId);
        }

        // ------------------------------------------------------------------------
        // 4. Update Database
        // ------------------------------------------------------------------------

        const updatedUser = await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                ...(name !== undefined && { name }),
                ...(email !== undefined && { email }),
                ...(phone !== undefined && { phone }),
                ...(avatar !== undefined && { avatar }),
                ...(publicId !== undefined && { publicId }),
                ...(role !== undefined && { role }),
            },
        });

        // ------------------------------------------------------------------------
        // 5. Response Transformation
        // ------------------------------------------------------------------------

        return {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            avatar: updatedUser.avatar,
            publicId: updatedUser.publicId,
            role: updatedUser.role,
            status: updatedUser.status,
            isVerified: updatedUser.isVerified,
            lastLoginAt: updatedUser.lastLoginAt,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
        };
    }
}
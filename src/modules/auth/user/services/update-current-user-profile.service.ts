import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '../../../../infrastructure/database/generated/prisma/client.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../../infrastructure/database/generated/prisma/client.js';
import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { CloudinaryService } from '../../../../infrastructure/storage/cloudinary/services/cloudinary.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import { CurrentUserResponseDto } from '../dto/responses/current-user-response.dto.js';
import { UpdateCurrentUserProfileDto } from '../dto/requests/update-current-user-profile.dto.js';
import { GetCurrentUserService } from './get-current-user.service.js';

@Injectable()
export class UpdateCurrentUserProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly createActivityLog: CreateActivityLogService,
    private readonly getCurrentUserService: GetCurrentUserService,
  ) {}

  async execute(
    userId: string,
    dto: UpdateCurrentUserProfileDto,
  ): Promise<CurrentUserResponseDto> {
    if (Object.values(dto).every((value) => value === undefined)) {
      throw new BadRequestException('At least one profile field is required.');
    }

    if ((dto.avatar === undefined) !== (dto.publicId === undefined)) {
      throw new BadRequestException(
        'Avatar URL and Cloudinary public ID must be updated together.',
      );
    }

    if (
      dto.avatar !== undefined &&
      (dto.avatar === null) !== (dto.publicId === null)
    ) {
      throw new BadRequestException(
        'Avatar URL and Cloudinary public ID must both be removed together.',
      );
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        name: true,
        phone: true,
        avatar: true,
        publicId: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (
      dto.publicId !== undefined &&
      dto.publicId !== null &&
      dto.publicId !== user.publicId &&
      !this.cloudinaryService.isUserAssetOwnedBy(userId, dto.publicId)
    ) {
      throw new BadRequestException(
        'Profile avatars must be uploaded to your own account folder.',
      );
    }

    const updatedUser = await this.prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const updated = await transaction.user.update({
          where: { id: userId },
          data: {
            ...(dto.name !== undefined && { name: dto.name.trim() }),
            ...(dto.phone !== undefined && { phone: dto.phone }),
            ...(dto.avatar !== undefined && { avatar: dto.avatar }),
            ...(dto.publicId !== undefined && { publicId: dto.publicId }),
          },
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
            publicId: true,
          },
        });

        await this.createActivityLog.execute(
          {
            type: ActivityType.UPDATE,
            module: ActivityModule.USER,
            action: 'UPDATE_OWN_PROFILE',
            entityType: 'User',
            entityId: updated.id,
            userId,
            oldValue: {
              name: user.name,
              phone: user.phone,
              avatar: user.avatar,
              publicId: user.publicId,
            },
            newValue: {
              name: updated.name,
              phone: updated.phone,
              avatar: updated.avatar,
              publicId: updated.publicId,
            },
          },
          transaction,
        );

        return updated;
      },
    );

    if (
      user.publicId &&
      (updatedUser.publicId === null || updatedUser.publicId !== user.publicId)
    ) {
      await this.cloudinaryService.delete(user.publicId);
    }

    return this.getCurrentUserService.execute(userId);
  }
}

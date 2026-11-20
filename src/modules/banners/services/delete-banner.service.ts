import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../infrastructure/database/generated/prisma/client.js';
import { CloudinaryService } from '../../../infrastructure/storage/cloudinary/services/cloudinary.service.js';

@Injectable()
export class DeleteBannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(bannerId: string, userId: string): Promise<void> {
    const banner = await this.prisma.banner.findUnique({
      where: { id: bannerId },
      include: { images: true },
    });

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.banner.delete({ where: { id: bannerId } });
      await this.createActivityLogService.execute(
        {
          type: ActivityType.DELETE,
          module: ActivityModule.OTHER,
          action: 'DELETE_BANNER',
          entityType: 'Banner',
          entityId: bannerId,
          userId,
          oldValue: {
            imagePublicIds: banner.images.map((image) => image.publicId),
          },
        },
        tx,
      );
    });

    const publicIds = new Set([
      ...banner.images.map((image) => image.publicId),
      banner.imagePublicId,
      ...(banner.mobileImagePublicId ? [banner.mobileImagePublicId] : []),
    ]);
    await Promise.all(
      [...publicIds].map((publicId) => this.cloudinaryService.delete(publicId)),
    );
  }
}

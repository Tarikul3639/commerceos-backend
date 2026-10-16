import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';

@Injectable()
export class DeleteBannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,

    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(bannerId: string): Promise<void> {
    const banner = await this.prisma.banner.findUnique({
      where: {
        id: bannerId,
      },
      select: {
        imagePublicId: true,
        mobileImagePublicId: true,
      },
    });

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    const publicIds = [banner.imagePublicId, banner.mobileImagePublicId].filter(
      (publicId): publicId is string => !!publicId,
    );
    await Promise.all(
      publicIds.map((publicId) => this.cloudinaryService.delete(publicId)),
    );

    await this.prisma.banner.delete({
      where: {
        id: bannerId,
      },
    });
    await this.createActivityLogService.execute({
      type: ActivityType.DELETE,
      module: ActivityModule.OTHER,
      action: 'DELETE_BANNER',
      entityType: 'Banner',
      entityId: bannerId,
      oldValue: {
        imagePublicId: banner.imagePublicId,
        mobileImagePublicId: banner.mobileImagePublicId,
      },
    });
  }
}

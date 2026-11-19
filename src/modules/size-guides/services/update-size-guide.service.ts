import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../infrastructure/database/generated/prisma/enums.js';
import { UpdateSizeGuideDto } from '../dto/requests/update-size-guide.dto.js';
import { SizeGuideResponseDto } from '../dto/responses/size-guide-response.dto.js';

@Injectable()
export class UpdateSizeGuideService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(
    id: string,
    dto: UpdateSizeGuideDto,
    userId: string,
  ): Promise<SizeGuideResponseDto> {
    const sizeGuide = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.sizeGuide.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          unit: true,
          columns: true,
          rows: true,
        },
      });
      if (!existing) throw new NotFoundException('Size guide not found');

      if (dto.name !== undefined) {
        const duplicate = await tx.sizeGuide.findFirst({
          where: {
            name: { equals: dto.name, mode: 'insensitive' },
            NOT: { id },
          },
          select: { id: true },
        });
        if (duplicate) throw new ConflictException('Size guide already exists');
      }

      const updated = await tx.sizeGuide.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.unit !== undefined && { unit: dto.unit }),
          ...(dto.columns !== undefined && { columns: dto.columns }),
          ...(dto.rows !== undefined && { rows: dto.rows }),
        },
      });
      const snapshot = (value: typeof existing | typeof updated) => ({
        name: value.name,
        description: value.description,
        unit: value.unit,
        columns: value.columns,
        rows: value.rows,
      });
      await this.createActivityLogService.execute(
        {
          type: ActivityType.UPDATE,
          module: ActivityModule.OTHER,
          action: 'UPDATE_SIZE_GUIDE',
          description: `Size guide "${existing.name}" was updated`,
          entityType: 'SizeGuide',
          entityId: updated.id,
          userId,
          oldValue: snapshot(existing),
          newValue: snapshot(updated),
        },
        tx,
      );
      return updated;
    });
    return sizeGuide as unknown as SizeGuideResponseDto;
  }
}

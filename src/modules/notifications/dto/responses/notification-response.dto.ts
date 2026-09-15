import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@/lib/prisma/client';
import { NotificationPaginationMetaDto } from './notification-pagination-meta.dto';

export class NotificationResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    title!: string;

    @ApiProperty()
    message!: string;

    @ApiProperty({
        enum: NotificationType,
    })
    type!: NotificationType;

    @ApiProperty()
    isRead!: boolean;

    @ApiPropertyOptional({
        nullable: true,
    })
    link!: string | null;

    @ApiPropertyOptional({
        nullable: true,
    })
    entityType!: string | null;

    @ApiPropertyOptional({
        nullable: true,
    })
    entityId!: string | null;

    @ApiProperty()
    userId!: string;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

export class NotificationPaginationResponseDto {
    @ApiProperty({
        type: [NotificationResponseDto],
    })
    data!: NotificationResponseDto[];

    @ApiProperty({
        type: NotificationPaginationMetaDto,
    })
    meta!: NotificationPaginationMetaDto;
}
import { ApiProperty } from '@nestjs/swagger';

export class NotificationPaginationMetaDto {
    @ApiProperty()
    page!: number;

    @ApiProperty()
    limit!: number;

    @ApiProperty()
    total!: number;

    @ApiProperty()
    totalPages!: number;

    @ApiProperty()
    unreadCount!: number;

    @ApiProperty()
    hasNextPage!: boolean;

    @ApiProperty()
    hasPreviousPage!: boolean;
}
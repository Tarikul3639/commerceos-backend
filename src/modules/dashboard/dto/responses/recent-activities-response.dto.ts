import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecentUserDto {
    @ApiProperty()
    id!: string;

    @ApiPropertyOptional()
    name!: string | null;

    @ApiProperty()
    email!: string;

    @ApiPropertyOptional({
        example: 'https://example.com/user-avatar.jpg',
    })
    avatar?: string | null;
}

export class RecentActivityItemDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    type!: string;

    @ApiProperty()
    module!: string;

    @ApiProperty()
    action!: string;

    @ApiPropertyOptional()
    description!: string | null;

    @ApiPropertyOptional()
    entityType!: string | null;

    @ApiPropertyOptional()
    entityId!: string | null;

    @ApiPropertyOptional()
    userId!: string | null;

    @ApiPropertyOptional({
        type: RecentUserDto,
    })
    user!: RecentUserDto | null;

    @ApiProperty()
    createdAt!: Date;
}
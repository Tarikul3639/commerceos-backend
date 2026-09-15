import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ActivityLogResponseDto {
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
    oldValue!: unknown;

    @ApiPropertyOptional()
    newValue!: unknown;

    @ApiPropertyOptional()
    ipAddress!: string | null;

    @ApiPropertyOptional()
    userAgent!: string | null;

    @ApiPropertyOptional()
    userId!: string | null;

    @ApiPropertyOptional({
        type: Object,
    })
    user?: {
        id: string;
        name: string | null;
        email: string;
    } | null;

    @ApiProperty()
    createdAt!: Date;
}
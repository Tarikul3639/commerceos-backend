import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { EmailStatus } from '@/lib/prisma/client';

export class EmailLogResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    to!: string;

    @ApiProperty()
    subject!: string;

    @ApiProperty()
    body!: string;

    @ApiProperty({
        enum: EmailStatus,
    })
    status!: EmailStatus;

    @ApiPropertyOptional({
        nullable: true,
    })
    errorMessage!: string | null;

    @ApiPropertyOptional({
        nullable: true,
    })
    sentAt!: Date | null;

    @ApiPropertyOptional({
        nullable: true,
    })
    entityType!: string | null;

    @ApiPropertyOptional({
        nullable: true,
    })
    entityId!: string | null;

    @ApiProperty()
    attemptCount!: number;

    @ApiPropertyOptional({
        nullable: true,
    })
    triggeredById!: string | null;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
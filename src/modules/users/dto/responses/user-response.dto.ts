import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserStatus } from '../../../../lib/prisma/client';

export class UserResponseDto {
    @ApiProperty({
        example: 'cmf123456789',
    })
    id!: string;

    @ApiProperty({
        example: 'John Doe',
    })
    name!: string;

    @ApiProperty({
        example: 'user@example.com',
    })
    email!: string;

    @ApiPropertyOptional({
        example: '+8801712345678',
        nullable: true,
    })
    phone?: string | null;

    @ApiPropertyOptional({
        example: 'https://example.com/avatar.jpg',
        nullable: true,
    })
    avatar?: string | null;

    @ApiProperty({
        enum: UserStatus,
        example: UserStatus.ACTIVE,
    })
    status!: UserStatus;

    @ApiProperty({
        example: true,
    })
    isVerified!: boolean;

    @ApiPropertyOptional({
        example: '2026-09-10T10:30:00.000Z',
        nullable: true,
    })
    lastLoginAt?: Date | null;

    @ApiProperty({
        example: '2026-09-10T10:30:00.000Z',
    })
    createdAt!: Date;

    @ApiProperty({
        example: '2026-09-10T10:30:00.000Z',
    })
    updatedAt!: Date;
}
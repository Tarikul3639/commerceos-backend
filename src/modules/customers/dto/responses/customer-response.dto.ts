import { CustomerStatus } from '../../../../lib/prisma/client';

import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

export class CustomerResponseDto {
    @ApiProperty({
        example: 'cmf123456789',
    })
    id!: string;

    @ApiProperty({
        example: 'John Doe',
    })
    name!: string;

    @ApiProperty({
        example: 'customer@example.com',
    })
    email!: string;

    @ApiPropertyOptional({
        example: '+8801712345678',
        nullable: true,
    })
    phone!: string | null;

    @ApiPropertyOptional({
        example: 'Dhaka, Bangladesh',
        nullable: true,
    })
    address!: string | null;

    @ApiProperty({
        enum: CustomerStatus,
        example: CustomerStatus.ACTIVE,
    })
    status!: CustomerStatus;

    @ApiProperty({
        example: false,
    })
    isVerified!: boolean;

    @ApiPropertyOptional({
        example: '2026-09-11T10:30:00.000Z',
        nullable: true,
    })
    lastLoginAt!: Date | null;

    @ApiProperty({
        example: '2026-09-01T10:30:00.000Z',
    })
    createdAt!: Date;

    @ApiProperty({
        example: '2026-09-11T10:30:00.000Z',
    })
    updatedAt!: Date;
}
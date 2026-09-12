import {
    DiscountType,
} from '../../../../../lib/prisma/client';

import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

export class DiscountResponseDto {
    @ApiProperty({
        example: 'cmf123456789',
    })
    id!: string;

    @ApiProperty({
        example: 'Eid Sale',
    })
    name!: string;

    @ApiPropertyOptional({
        example: 'Special Eid discount campaign',
        nullable: true,
    })
    description!: string | null;

    @ApiProperty({
        enum: DiscountType,
        example: DiscountType.PERCENTAGE,
    })
    type!: DiscountType;

    @ApiProperty({
        example: '10',
    })
    value!: string;

    @ApiPropertyOptional({
        example: '2026-09-15T00:00:00.000Z',
        nullable: true,
    })
    startDate!: Date | null;

    @ApiPropertyOptional({
        example: '2026-09-30T23:59:59.000Z',
        nullable: true,
    })
    endDate!: Date | null;

    @ApiProperty({
        example: true,
    })
    isActive!: boolean;

    @ApiProperty({
        example: 'cmfuser123',
    })
    createdById!: string;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
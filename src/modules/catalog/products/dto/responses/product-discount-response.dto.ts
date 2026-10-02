import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { DiscountType } from '../../../../../lib/prisma/enums'

export class ProductDiscountResponseDto {
    @ApiProperty({
        enum: DiscountType,
        enumName: 'DiscountType',
        example: DiscountType.PERCENTAGE,
    })
    id!: string

    @ApiProperty()
    name!: string

    @ApiPropertyOptional({ nullable: true })
    description!: string | null

    @ApiProperty({
        enum: DiscountType,
        enumName: 'DiscountType',
        example: DiscountType.PERCENTAGE,
    })
    type!: DiscountType

    @ApiProperty({
        example: '20.00',
    })
    value!: string

    @ApiPropertyOptional({
        nullable: true,
        example: '2026-10-01T00:00:00.000Z',
    })
    startDate!: Date | null

    @ApiPropertyOptional({
        nullable: true,
        example: '2026-10-31T23:59:59.999Z',
    })
    endDate!: Date | null

    @ApiProperty({
        example: true,
    })
    isActive!: boolean
}
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class StockMovementProductResponseDto {
    @ApiProperty({
        example: 'cmf123productid',
    })
    id!: string;

    @ApiProperty({
        example: 'Nike Air Max 270',
    })
    name!: string;

    @ApiProperty({
        example: 'nike-air-max-270',
    })
    slug!: string;
}

class StockMovementVariantResponseDto {
    @ApiProperty({
        example: 'cmf123variantid',
    })
    id!: string;

    @ApiProperty({
        example: 'NIKE-AM-270-BLK-42',
    })
    sku!: string;

    @ApiProperty({
        type: () => StockMovementProductResponseDto,
    })
    product!: StockMovementProductResponseDto;
}

class StockMovementWarehouseResponseDto {
    @ApiProperty({
        example: 'cmf123warehouseid',
    })
    id!: string;

    @ApiProperty({
        example: 'Dhaka Main Warehouse',
    })
    name!: string;
}

class StockMovementUserResponseDto {
    @ApiProperty({
        example: 'cmf123userid',
    })
    id!: string;

    @ApiProperty({
        example: 'John Doe',
    })
    name!: string;

    @ApiProperty({
        example: 'john@example.com',
    })
    email!: string;
}

export class StockMovementResponseDto {
    @ApiProperty({
        example: 'cmf123stockmovementid',
    })
    id!: string;

    @ApiProperty({
        example: 'ADJUSTMENT',
        description: 'Type of stock movement',
    })
    type!: string;

    @ApiProperty({
        example: 10,
        description:
            'Positive value increases stock, negative value decreases stock',
    })
    quantity!: number;

    @ApiProperty({
        example: 50,
        description: 'Stock quantity before the movement',
    })
    previousQuantity!: number;

    @ApiProperty({
        example: 60,
        description: 'Stock quantity after the movement',
    })
    currentQuantity!: number;

    @ApiPropertyOptional({
        example: 'Initial stock adjustment',
        nullable: true,
    })
    reason!: string | null;

    @ApiProperty({
        type: () => StockMovementVariantResponseDto,
    })
    variant!: StockMovementVariantResponseDto;

    @ApiProperty({
        type: () => StockMovementWarehouseResponseDto,
    })
    warehouse!: StockMovementWarehouseResponseDto;

    @ApiProperty({
        type: () => StockMovementUserResponseDto,
    })
    user!: StockMovementUserResponseDto;

    @ApiProperty({
        example: '2026-09-13T10:30:00.000Z',
        format: 'date-time',
    })
    createdAt!: Date;
}
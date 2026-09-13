import { ApiProperty } from '@nestjs/swagger';

export class StockResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    quantity!: number;

    @ApiProperty()
    reservedQuantity!: number;

    @ApiProperty({
        description: 'Available quantity after reserved stock',
    })
    availableQuantity!: number;

    @ApiProperty()
    variantId!: string;

    @ApiProperty()
    sku!: string;

    @ApiProperty()
    productId!: string;

    @ApiProperty()
    productName!: string;

    @ApiProperty()
    warehouseId!: string;

    @ApiProperty()
    warehouseName!: string;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
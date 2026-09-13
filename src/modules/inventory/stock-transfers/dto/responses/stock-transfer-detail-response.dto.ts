import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import { StockTransferStatus } from '@/lib/prisma/client';

class StockTransferWarehouseResponseDto {
    @ApiProperty({
        example: 'cmf123warehouseid',
    })
    id!: string;

    @ApiProperty({
        example: 'Main Warehouse',
    })
    name!: string;
}

class StockTransferUserResponseDto {
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

class StockTransferProductResponseDto {
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

class StockTransferVariantResponseDto {
    @ApiProperty({
        example: 'cmf123variantid',
    })
    id!: string;

    @ApiProperty({
        example: 'NIKE-AM270-BLK-42',
    })
    sku!: string;

    @ApiProperty({
        type: () => StockTransferProductResponseDto,
    })
    product!: StockTransferProductResponseDto;
}

class StockTransferItemResponseDto {
    @ApiProperty({
        example: 'cmf123itemid',
    })
    id!: string;

    @ApiProperty({
        example: 10,
    })
    quantity!: number;

    @ApiProperty({
        type: () => StockTransferVariantResponseDto,
    })
    variant!: StockTransferVariantResponseDto;

    @ApiProperty({
        example: '2026-09-13T10:30:00.000Z',
    })
    createdAt!: Date;

    @ApiProperty({
        example: '2026-09-13T10:30:00.000Z',
    })
    updatedAt!: Date;
}

export class StockTransferDetailResponseDto {
    @ApiProperty({
        example: 'cmf123transferid',
    })
    id!: string;

    @ApiProperty({
        example: 'TRF-000001',
    })
    transferNo!: string;

    @ApiProperty({
        enum: StockTransferStatus,
        example: StockTransferStatus.PENDING,
    })
    status!: StockTransferStatus;

    @ApiPropertyOptional({
        example: 'Transfer stock to Gazipur warehouse',
        nullable: true,
    })
    notes!: string | null;

    @ApiProperty({
        type: () => StockTransferWarehouseResponseDto,
    })
    fromWarehouse!: StockTransferWarehouseResponseDto;

    @ApiProperty({
        type: () => StockTransferWarehouseResponseDto,
    })
    toWarehouse!: StockTransferWarehouseResponseDto;

    @ApiProperty({
        type: () => StockTransferUserResponseDto,
    })
    user!: StockTransferUserResponseDto;

    @ApiProperty({
        type: () => [StockTransferItemResponseDto],
    })
    items!: StockTransferItemResponseDto[];

    @ApiProperty({
        example: '2026-09-13T10:30:00.000Z',
    })
    createdAt!: Date;

    @ApiProperty({
        example: '2026-09-13T10:30:00.000Z',
    })
    updatedAt!: Date;
}
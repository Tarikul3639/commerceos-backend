import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import { StockTransferStatus } from '@/lib/prisma/client';

export class StockTransferResponseDto {
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
        example: 'cmf123warehouseid',
    })
    fromWarehouseId!: string;

    @ApiProperty({
        example: 'Main Warehouse',
    })
    fromWarehouseName!: string;

    @ApiProperty({
        example: 'cmf456warehouseid',
    })
    toWarehouseId!: string;

    @ApiProperty({
        example: 'Gazipur Warehouse',
    })
    toWarehouseName!: string;

    @ApiProperty({
        example: 3,
        description: 'Total number of items in this transfer',
    })
    totalItems!: number;

    @ApiProperty({
        example: 'cmf123userid',
    })
    userId!: string;

    @ApiProperty({
        example: 'John Doe',
    })
    userName!: string;

    @ApiProperty({
        example: '2026-09-13T10:30:00.000Z',
    })
    createdAt!: Date;

    @ApiProperty({
        example: '2026-09-13T10:30:00.000Z',
    })
    updatedAt!: Date;
}
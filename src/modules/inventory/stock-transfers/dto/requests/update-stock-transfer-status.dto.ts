import {
    IsEnum,
} from 'class-validator';

import {
    ApiProperty,
} from '@nestjs/swagger';

import {
    StockTransferStatus,
} from '../../../../../lib/prisma/client';

export class UpdateStockTransferStatusDto {
    @ApiProperty({
        enum: StockTransferStatus,
        example: StockTransferStatus.COMPLETED,
        description: 'New stock transfer status',
    })
    @IsEnum(StockTransferStatus)
    status!: StockTransferStatus;
}
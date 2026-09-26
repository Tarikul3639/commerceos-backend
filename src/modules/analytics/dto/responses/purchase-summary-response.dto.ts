import { ApiProperty } from '@nestjs/swagger';

export class PurchaseSummaryResponseDto {
    @ApiProperty({
        example: '850000',
    })
    totalPurchases!: string;

    @ApiProperty({
        example: '25000',
    })
    todayPurchases!: string;

    @ApiProperty({
        example: 325,
    })
    totalPurchaseOrders!: number;

    @ApiProperty({
        example: 12,
    })
    pendingPurchases!: number;

    @ApiProperty({
        example: 8.4,
    })
    purchaseGrowth!: number;
}
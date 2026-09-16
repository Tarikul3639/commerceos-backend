import { ApiProperty } from '@nestjs/swagger';

export class OrderSummaryResponseDto {
    @ApiProperty({
        example: 1248,
    })
    totalOrders!: number;

    @ApiProperty({
        example: 42,
    })
    pendingOrders!: number;

    @ApiProperty({
        example: 35,
    })
    processingOrders!: number;

    @ApiProperty({
        example: 18,
    })
    shippedOrders!: number;

    @ApiProperty({
        example: 1120,
    })
    deliveredOrders!: number;

    @ApiProperty({
        example: 33,
    })
    cancelledOrders!: number;
}
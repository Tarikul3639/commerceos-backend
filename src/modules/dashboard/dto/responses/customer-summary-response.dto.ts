import { ApiProperty } from '@nestjs/swagger';

export class CustomerSummaryResponseDto {
    @ApiProperty({
        example: 5420,
    })
    totalCustomers!: number;

    @ApiProperty({
        example: 125,
    })
    newCustomers!: number;

    @ApiProperty({
        example: 850,
    })
    activeCustomers!: number;

    @ApiProperty({
        example: 420,
    })
    returningCustomers!: number;

    @ApiProperty({
        example: 8.7,
    })
    customerGrowth!: number;
}
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TopCustomerItemDto {
    @ApiProperty()
    customerId!: string;

    @ApiProperty({
        example: 'Rahim Ahmed',
    })
    customerName!: string;

    @ApiPropertyOptional({
        example: 'https://example.com/customer-image.jpg',
    })
    customerImage?: string | null;

    @ApiPropertyOptional({
        example: 'example@gmail.com'
    })
    email?: string;

    @ApiPropertyOptional({
        example: '+8801234567890'
    })
    phone?: string;

    @ApiProperty({
        example: 42,
    })
    totalOrders!: number;

    @ApiProperty({
        example: '250000',
    })
    totalSpent!: string;
}

export class TopCustomersResponseDto {
    @ApiProperty({
        type: [TopCustomerItemDto],
    })
    data!: TopCustomerItemDto[];
}
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TopProductItemDto {
    @ApiProperty()
    productId!: string;

    @ApiProperty()
    productName!: string;

    @ApiPropertyOptional({
        example: 'https://example.com/product-image.jpg',
    })
    productImage?: string | null;

    @ApiPropertyOptional()
    variantId?: string;

    @ApiPropertyOptional()
    sku?: string;

    @ApiProperty({
        example: 420,
    })
    totalSold!: number;

    @ApiProperty({
        example: '1250000',
    })
    totalRevenue!: string;
}

export class TopProductsResponseDto {
    @ApiProperty({
        type: [TopProductItemDto],
    })
    data!: TopProductItemDto[];
}
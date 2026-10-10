import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LowStockProductItemDto {
  @ApiProperty({
    example: 'clx123variant',
  })
  variantId!: string;

  @ApiProperty({
    example: 'SKU-001',
  })
  sku!: string;

  @ApiProperty({
    example: 'clx123product',
  })
  productId!: string;

  @ApiProperty({
    example: 'iPhone 15',
  })
  productName!: string;

  @ApiPropertyOptional({
    example: 'https://example.com/product-image.jpg',
    nullable: true,
  })
  productImage?: string | null;

  @ApiProperty({
    example: 3,
    description: 'Current stock quantity of the product variant',
  })
  quantity!: number;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationMetaDto } from '@/common/dto/responses/pagination-meta.dto';

/* ============================================================================
 * DTO: StockResponseDto
 * ============================================================================ */

export class StockResponseDto {
  /* --------------------------------------------------------------------------
   * Identifiers & References
   * -------------------------------------------------------------------------- */

  @ApiProperty({
    description: 'Unique stock record identifier',
    example: 'clx123abc456',
  })
  id!: string;

  @ApiProperty({
    description: 'Product identifier',
    example: 'clx789xyz123',
  })
  productId!: string;

  @ApiProperty({
    description: 'Product variant identifier',
    example: 'clx456variant789',
  })
  variantId!: string;

  /* --------------------------------------------------------------------------
   * Stock Details
   * -------------------------------------------------------------------------- */

  @ApiProperty({
    description: 'Current product variant stock quantity',
    example: 25,
  })
  quantity!: number;

  @ApiProperty({
    description: 'Product variant SKU',
    example: 'TSHIRT-RED-M',
  })
  sku!: string;

  /* --------------------------------------------------------------------------
   * Product Info & Metadata
   * -------------------------------------------------------------------------- */

  @ApiProperty({
    description: 'Product name',
    example: 'Classic Cotton T-Shirt',
  })
  productName!: string;

  @ApiPropertyOptional({
    description: 'Primary product image URL',
    example: 'https://res.cloudinary.com/demo/image/upload/tshirt.jpg',
    nullable: true,
  })
  productImage!: string | null;

  @ApiProperty({
    description: 'Last stock update timestamp',
    example: '2026-10-04T10:30:00.000Z',
  })
  updatedAt!: Date;
}

/* ============================================================================
 * DTO: StockListResponseDto
 * ============================================================================ */

export class StockListResponseDto {
  @ApiProperty({
    description: 'List of stock records',
    type: [StockResponseDto],
  })
  data!: StockResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta!: PaginationMetaDto;
}

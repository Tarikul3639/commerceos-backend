import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/*
 * DTO: StockResponseDto
 */

export class StockResponseDto {
  /*
   * Identifiers & References
   */

  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  /*
   * Stock Details
   */

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  sku!: string;

  /*
   * Product Info & Metadata
   */

  @ApiProperty()
  productName!: string;

  @ApiPropertyOptional({ nullable: true })
  productImage!: string | null;

  @ApiProperty()
  updatedAt!: Date;
}
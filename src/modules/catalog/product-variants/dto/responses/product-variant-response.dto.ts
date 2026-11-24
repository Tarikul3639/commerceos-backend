import { ApiProperty } from '@nestjs/swagger';

export class ProductVariantResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  sku!: string;

  @ApiProperty({ type: String, nullable: true })
  barcode!: string | null;

  @ApiProperty()
  stock!: number;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  options!: Record<string, string>;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: String, nullable: true })
  deletedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

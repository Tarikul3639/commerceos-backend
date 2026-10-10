import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductVariantResponseDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional({ nullable: true }) title!: string | null;
  @ApiProperty() sku!: string;
  @ApiPropertyOptional({ nullable: true }) barcode!: string | null;
  @ApiProperty() stock!: number;
  @ApiProperty() isActive!: boolean;
  @ApiPropertyOptional({ nullable: true }) deletedAt!: Date | null;
  @ApiProperty() productId!: string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

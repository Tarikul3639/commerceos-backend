import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CartProductResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() price!: string;
  @ApiPropertyOptional({ nullable: true }) imageUrl!: string | null;
}

export class CartVariantResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() sku!: string;
  @ApiPropertyOptional({ nullable: true }) colorName!: string | null;
  @ApiPropertyOptional({ nullable: true }) colorHex!: string | null;
  @ApiPropertyOptional({ nullable: true }) size!: string | null;
}

export class CartItemResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() quantity!: number;
  @ApiProperty() productId!: string;
  @ApiPropertyOptional({ nullable: true }) variantId!: string | null;
  @ApiPropertyOptional({ type: CartVariantResponseDto, nullable: true })
  variant!: CartVariantResponseDto | null;
  @ApiProperty({ type: CartProductResponseDto })
  product!: CartProductResponseDto;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class CartResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() customerId!: string;
  @ApiProperty({ type: [CartItemResponseDto] }) items!: CartItemResponseDto[];
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductOptionType } from '../../../../infrastructure/database/generated/prisma/enums.js';

export class CartProductResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() price!: string;
  @ApiPropertyOptional({ nullable: true }) imageUrl!: string | null;
}

export class CartVariantOptionResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() label!: string;
  @ApiProperty({ nullable: true }) colorCode!: string | null;
  @ApiProperty() optionId!: string;
  @ApiProperty() optionName!: string;
  @ApiProperty({ enum: ProductOptionType, enumName: 'ProductOptionType' })
  optionType!: ProductOptionType;
}

export class CartVariantResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() sku!: string;
  @ApiProperty() stock!: number;
  @ApiPropertyOptional({ nullable: true }) colorName!: string | null;
  @ApiPropertyOptional({ nullable: true }) colorHex!: string | null;
  @ApiPropertyOptional({ nullable: true }) size!: string | null;
  @ApiProperty({ type: [CartVariantOptionResponseDto] })
  options!: CartVariantOptionResponseDto[];
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
  @ApiProperty({ description: 'Available stock for the selected variant' })
  stock!: number;
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

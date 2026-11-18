import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminCartCustomerResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() email!: string;
  @ApiPropertyOptional({ nullable: true }) phone!: string | null;
}

export class AdminCartProductResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() price!: string;
  @ApiPropertyOptional({ nullable: true }) imageUrl!: string | null;
}

export class AdminCartVariantResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() sku!: string;
  @ApiPropertyOptional({ nullable: true }) title!: string | null;
  @ApiProperty() stock!: number;
}

export class AdminCartItemResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() quantity!: number;
  @ApiProperty() productId!: string;
  @ApiPropertyOptional({ nullable: true }) variantId!: string | null;
  @ApiProperty({ type: AdminCartProductResponseDto })
  product!: AdminCartProductResponseDto;
  @ApiPropertyOptional({ type: AdminCartVariantResponseDto, nullable: true })
  variant!: AdminCartVariantResponseDto | null;
}

export class AdminCartResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() customerId!: string;
  @ApiProperty({ type: AdminCartCustomerResponseDto })
  customer!: AdminCartCustomerResponseDto;
  @ApiProperty({ type: [AdminCartItemResponseDto] })
  items!: AdminCartItemResponseDto[];
  @ApiProperty() itemCount!: number;
  @ApiProperty() totalQuantity!: number;
  @ApiProperty({ description: 'Estimated merchandise value; not a checkout total' })
  estimatedValue!: string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class AdminCartsPaginatedResponseDto {
  @ApiProperty({ type: [AdminCartResponseDto] })
  data!: AdminCartResponseDto[];

  @ApiProperty({
    example: {
      total: 42,
      page: 1,
      limit: 10,
      totalPages: 5,
      hasNextPage: true,
      hasPreviousPage: false,
    },
  })
  meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

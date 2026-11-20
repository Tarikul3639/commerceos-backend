import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WishlistProductResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() price!: string;
  @ApiPropertyOptional({ nullable: true }) imageUrl!: string | null;
  @ApiProperty() isAvailable!: boolean;
}

export class WishlistItemResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() productId!: string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty({ type: WishlistProductResponseDto })
  product!: WishlistProductResponseDto;
}

export class WishlistResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() customerId!: string;
  @ApiProperty({ type: [WishlistItemResponseDto] })
  items!: WishlistItemResponseDto[];
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class AdminWishlistCustomerResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() email!: string;
  @ApiPropertyOptional({ nullable: true }) phone!: string | null;
}

export class AdminWishlistResponseDto extends WishlistResponseDto {
  @ApiProperty({ type: AdminWishlistCustomerResponseDto })
  customer!: AdminWishlistCustomerResponseDto;
  @ApiProperty() itemCount!: number;
}

export class AdminWishlistsPaginatedResponseDto {
  @ApiProperty({ type: [AdminWishlistResponseDto] })
  data!: AdminWishlistResponseDto[];
  @ApiProperty() meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

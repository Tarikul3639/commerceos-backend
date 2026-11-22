import { ApiProperty } from '@nestjs/swagger';

export class StoreProductListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  subDescription!: string | null;

  @ApiProperty()
  sellingPrice!: string;

  @ApiProperty({ type: String, nullable: true })
  originalPrice!: string | null;

  @ApiProperty({ type: String, nullable: true })
  discountPercentage!: string | null;

  @ApiProperty()
  categoryId!: string;

  @ApiProperty({ nullable: true })
  brandId!: string | null;

  @ApiProperty()
  isFeatured!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({
    type: [String],
    description: 'Product image URLs ordered by sortOrder',
  })
  images!: string[];
}

export class StoreProductListResponseDto {
  @ApiProperty({ type: [StoreProductListItemDto] })
  data!: StoreProductListItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}

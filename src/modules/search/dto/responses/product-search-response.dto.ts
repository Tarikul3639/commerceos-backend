import { ApiProperty } from '@nestjs/swagger';

export class ProductSearchResultDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: String, nullable: true })
  subDescription!: string | null;

  @ApiProperty()
  sellingPrice!: string;

  @ApiProperty({ type: String, nullable: true })
  originalPrice!: string | null;

  @ApiProperty({ type: String, nullable: true })
  discountPercentage!: string | null;

  @ApiProperty()
  stock!: number;

  @ApiProperty({ type: [String] })
  images!: string[];

  @ApiProperty()
  categoryName!: string;

  @ApiProperty({ type: String, nullable: true })
  brandName!: string | null;
}

export class ProductSearchResponseDto {
  @ApiProperty({ type: [ProductSearchResultDto] })
  data!: ProductSearchResultDto[];

  @ApiProperty()
  total!: number;
}

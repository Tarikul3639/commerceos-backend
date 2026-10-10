import { ApiProperty } from '@nestjs/swagger';

import { ProductResponseDto } from './product-response.dto';

export class ProductListMetaDto {
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() totalPages!: number;
  @ApiProperty() hasNextPage!: boolean;
  @ApiProperty() hasPreviousPage!: boolean;
}

export class ProductListResponseDto {
  @ApiProperty({ type: [ProductResponseDto] }) data!: ProductResponseDto[];
  @ApiProperty({ type: ProductListMetaDto }) meta!: ProductListMetaDto;
}

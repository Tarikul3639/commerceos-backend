import { ApiProperty } from '@nestjs/swagger';

import { PaginationMetaDto } from '../../../../../common/dto/responses/pagination-meta.dto';
import { ProductResponseDto } from './product-response.dto';

export class ProductListResponseDto {
  @ApiProperty({
    type: [ProductResponseDto],
    description: 'List of products',
  })
  data!: ProductResponseDto[];

  @ApiProperty({
    type: PaginationMetaDto,
    description: 'Pagination metadata',
  })
  meta!: PaginationMetaDto;
}

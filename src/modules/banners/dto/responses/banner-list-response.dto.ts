import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../../common/dto/responses/pagination-meta.dto.js';
import { BannerResponseDto } from './banner-response.dto.js';

export class BannerListResponseDto {
  @ApiProperty({
    type: [BannerResponseDto],
    description: 'List of banners',
  })
  data!: BannerResponseDto[];

  @ApiProperty({
    type: PaginationMetaDto,
    description: 'Pagination metadata',
  })
  meta!: PaginationMetaDto;
}

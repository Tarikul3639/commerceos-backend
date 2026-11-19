import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../../common/dto/responses/pagination-meta.dto.js';
import { DiscountResponseDto } from './discount-response.dto.js';

export class DiscountListResponseDto {
  @ApiProperty({ type: [DiscountResponseDto] }) data!: DiscountResponseDto[];
  @ApiProperty({ type: PaginationMetaDto }) meta!: PaginationMetaDto;
}

import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '@/common/dto/responses/pagination-meta.dto';
import { DiscountResponseDto } from './discount-response.dto';

export class DiscountListResponseDto {
  @ApiProperty({ type: [DiscountResponseDto] }) data!: DiscountResponseDto[];
  @ApiProperty({ type: PaginationMetaDto }) meta!: PaginationMetaDto;
}

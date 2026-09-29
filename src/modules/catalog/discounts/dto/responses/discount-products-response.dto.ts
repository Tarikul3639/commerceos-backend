import { ApiProperty } from '@nestjs/swagger';

import { PaginationMetaDto } from '../../../../../common/dto/responses/pagination-meta.dto';
import { DiscountProductResponseDto } from './discount-product-response.dto';

export class DiscountProductsResponseDto {
    @ApiProperty({
        type: [DiscountProductResponseDto],
    })
    data!: DiscountProductResponseDto[];

    @ApiProperty({
        type: PaginationMetaDto,
    })
    meta!: PaginationMetaDto;
}
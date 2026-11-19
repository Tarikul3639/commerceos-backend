import { ApiProperty } from '@nestjs/swagger';
import { ProductOptionType } from '../../../../../infrastructure/database/generated/prisma/enums.js';
import { ProductOptionValueResponseDto } from './product-option-value-response.dto.js';

export class ProductOptionResponseDto {
  @ApiProperty({ example: 'cm123coloroption' })
  id!: string;

  @ApiProperty({ example: 'Color' })
  name!: string;

  @ApiProperty({
    enum: ProductOptionType,
    enumName: 'ProductOptionType',
    example: ProductOptionType.COLOR,
  })
  type!: ProductOptionType;

  @ApiProperty({ example: 'cm123product456' })
  productId!: string;

  @ApiProperty({ type: [ProductOptionValueResponseDto] })
  values!: ProductOptionValueResponseDto[];

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}

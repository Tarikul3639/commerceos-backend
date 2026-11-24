import { ApiProperty } from '@nestjs/swagger';
import { ProductOptionType } from '../../../../../infrastructure/database/generated/prisma/enums.js';
import { ProductOptionValueResponseDto } from './product-option-value-response.dto.js';

export class ProductOptionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ProductOptionType, enumName: 'ProductOptionType' })
  type!: ProductOptionType;

  @ApiProperty()
  productId!: string;

  @ApiProperty({ type: [ProductOptionValueResponseDto] })
  values!: ProductOptionValueResponseDto[];

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}

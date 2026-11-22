import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '../../../../../infrastructure/database/generated/prisma/enums.js';

export class ProductDiscountResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: DiscountType, enumName: 'DiscountType' })
  type!: DiscountType;

  @ApiProperty()
  value!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  startsAt!: Date | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  endsAt!: Date | null;
}

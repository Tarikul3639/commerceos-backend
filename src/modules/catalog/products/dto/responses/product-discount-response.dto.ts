import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductDiscountResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() value!: string;
  @ApiPropertyOptional({ nullable: true }) startDate!: Date | null;
  @ApiPropertyOptional({ nullable: true }) endDate!: Date | null;
  @ApiProperty() createdById!: string;
}

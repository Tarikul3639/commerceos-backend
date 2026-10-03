import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DiscountSummaryResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() value!: string;
  @ApiPropertyOptional({ nullable: true }) startDate!: Date | null;
  @ApiPropertyOptional({ nullable: true }) endDate!: Date | null;
  @ApiProperty() createdById!: string;
}

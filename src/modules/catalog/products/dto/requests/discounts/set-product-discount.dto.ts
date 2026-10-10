import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SetProductDiscountDto {
  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(0)
  value!: number;

  @ApiPropertyOptional({ example: '2026-10-01T00:00:00.000Z', nullable: true })
  @IsOptional()
  @IsString()
  startDate?: string | null;

  @ApiPropertyOptional({ example: '2026-10-31T23:59:59.000Z', nullable: true })
  @IsOptional()
  @IsString()
  endDate?: string | null;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateDiscountDto {
  @ApiProperty({ example: 'cmf123productid' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 20, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  value!: number;

  @ApiPropertyOptional({ nullable: true, example: '2026-10-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-10-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string | null;
}

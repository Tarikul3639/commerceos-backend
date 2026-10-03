import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateDiscountDto {
  @ApiPropertyOptional({ example: 'cmf123productid' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productId?: string;

  @ApiPropertyOptional({ example: 20, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  value?: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string | null;
}

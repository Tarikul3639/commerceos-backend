import { IsBooleanString, IsOptional, IsString } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class StockQueryDto {
  @ApiPropertyOptional({
    example: 'Nike',
    description: 'Search by product name or SKU',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'true',
    description: 'Filter low stock items',
  })
  @IsOptional()
  @IsBooleanString()
  lowStock?: string;

  @ApiPropertyOptional({
    example: '1',
    default: '1',
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({
    example: '10',
    default: '10',
  })
  @IsOptional()
  @IsString()
  limit?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class StorefrontNewArrivalsQueryDto {
  @ApiPropertyOptional({
    example: 8,
    minimum: 1,
    maximum: 24,
    default: 8,
    description: 'Maximum number of new arrival products to return',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  limit = 8;
}

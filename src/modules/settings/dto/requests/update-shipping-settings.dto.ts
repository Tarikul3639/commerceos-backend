import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateShippingSettingsDto {
  @ApiPropertyOptional({
    example: 1500,
    nullable: true,
    description: 'Set null to disable free shipping.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  freeShippingThreshold?: number | null;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() ordersInApp?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() ordersEmail?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() returnsInApp?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() returnsEmail?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() inventoryInApp?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() inventoryEmail?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() paymentsInApp?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() paymentsEmail?: boolean;
}

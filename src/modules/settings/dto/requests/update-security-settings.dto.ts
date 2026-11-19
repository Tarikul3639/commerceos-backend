import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateSecuritySettingsDto {
  @ApiPropertyOptional({ example: 15, minimum: 5, maximum: 60 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(60)
  accessTokenLifetimeMinutes?: number;

  @ApiPropertyOptional({ example: 7, minimum: 1, maximum: 90 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  refreshTokenLifetimeDays?: number;

  @ApiPropertyOptional({ example: 30, minimum: 1, maximum: 180 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(180)
  rememberMeRefreshLifetimeDays?: number;

  @ApiPropertyOptional({ example: 8, minimum: 8, maximum: 128 })
  @IsOptional()
  @IsInt()
  @Min(8)
  @Max(128)
  minimumPasswordLength?: number;

  @ApiPropertyOptional({ example: 5, minimum: 3, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(10)
  maximumFailedLoginAttempts?: number;

  @ApiPropertyOptional({ example: 15, minimum: 5, maximum: 1440 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(1440)
  accountLockoutDurationMinutes?: number;
}

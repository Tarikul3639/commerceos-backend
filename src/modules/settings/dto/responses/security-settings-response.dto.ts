import { ApiProperty } from '@nestjs/swagger';

export class SecuritySettingsResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: 15 }) accessTokenLifetimeMinutes!: number;
  @ApiProperty({ example: 7 }) refreshTokenLifetimeDays!: number;
  @ApiProperty({ example: 30 }) rememberMeRefreshLifetimeDays!: number;
  @ApiProperty({ example: 12 }) minimumPasswordLength!: number;
  @ApiProperty({ example: 5 }) maximumFailedLoginAttempts!: number;
  @ApiProperty({ example: 15 }) accountLockoutDurationMinutes!: number;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

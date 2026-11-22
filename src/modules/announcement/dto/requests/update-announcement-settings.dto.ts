import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateAnnouncementSettingsDto {
  @ApiProperty({ example: 'Free delivery on orders over ৳5,000' })
  @IsString()
  @MinLength(1)
  @MaxLength(180)
  message!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

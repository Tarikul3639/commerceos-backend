import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateCurrentUserProfileDto {
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @ApiPropertyOptional({ example: 'Jane Doe', minLength: 2, maxLength: 100 })
  name?: string;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsPhoneNumber('BD')
  @ApiPropertyOptional({ example: '+8801712345678', nullable: true })
  phone?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @IsUrl()
  @MaxLength(500)
  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/example/avatar.jpg',
    nullable: true,
  })
  avatar?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiPropertyOptional({ example: 'users/avatar_public_id', nullable: true })
  publicId?: string | null;
}

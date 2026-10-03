import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({
    description: 'The full name of the customer',
    example: 'John Doe',
  })
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({
    description: 'The email address of the customer',
    example: 'customer@example.com',
  })
  email!: string;

  @IsOptional()
  @IsPhoneNumber('BD')
  @ApiPropertyOptional({
    description: 'The phone number of the customer',
    example: '+8801712345678',
  })
  phone?: string;

  @IsOptional()
  @IsUrl()
  @ApiPropertyOptional({
    description: 'The avatar URL of the customer',
    example: 'https://example.com/avatar.jpg',
  })
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiPropertyOptional({
    description: 'The public ID of the customer avatar',
    example: 'cus_1234567890',
  })
  publicId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiPropertyOptional({
    description: 'The address of the customer',
    example: 'Dhaka, Bangladesh',
  })
  address?: string;
}

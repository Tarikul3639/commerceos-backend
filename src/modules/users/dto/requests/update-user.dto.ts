import {
    IsEmail,
    IsOptional,
    IsPhoneNumber,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    @ApiPropertyOptional({
        description: 'The full name of the user',
        example: 'John Doe',
    })
    name?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    @ApiPropertyOptional({
        description: 'The email address of the user',
        example: 'user@example.com',
    })
    email?: string;

    @IsOptional()
    @IsPhoneNumber()
    @ApiPropertyOptional({
        description: 'The phone number of the user',
        example: '+8801712345678',
    })
    phone?: string;

    @IsOptional()
    @IsString()
    @IsUrl()
    @MaxLength(255)
    @ApiPropertyOptional({
        description: "The URL of the user's avatar image",
        example: 'https://example.com/avatar.jpg',
    })
    avatar?: string;
}
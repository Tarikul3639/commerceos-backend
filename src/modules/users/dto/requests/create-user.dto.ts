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

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    @ApiProperty({
        description: 'The full name of the user',
        example: 'John Doe',
    })
    name!: string;

    @IsEmail()
    @IsNotEmpty()
    @MaxLength(255)
    @ApiProperty({
        description: 'The email address of the user',
        example: 'user@example.com',
    })
    email!: string;

    @IsOptional()
    @IsPhoneNumber("BD")
    @ApiPropertyOptional({
        description: 'The phone number of the user',
        example: '+8801712345678',
    })
    phone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    @IsUrl()
    @ApiPropertyOptional({
        description: "The URL of the user's avatar image",
        example: 'https://example.com/avatar.jpg',
    })
    avatar?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        description: "The public ID of the user's avatar image in Cloudinary",
        example: 'avatar_public_id',
    })
    publicId?: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The role ID assigned to the user',
        example: 'cmf123456789',
    })
    roleId!: string;
}

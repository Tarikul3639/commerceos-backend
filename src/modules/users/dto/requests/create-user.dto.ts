import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
    IsUrl,
    Matches,
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
    @IsPhoneNumber()
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

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(100)
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=])[A-Za-z\d@$!%*?&^#()_\-+=]+$/,
        {
            message:
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        },
    )
    @ApiProperty({
        description: 'The password of the user',
        example: 'Password123!',
    })
    password!: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The role ID assigned to the user',
        example: 'cmf123456789',
    })
    roleId!: string;
}

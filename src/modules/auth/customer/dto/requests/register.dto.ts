import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

import {
    ApiProperty,
} from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({
        example: 'John Doe',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!: string;

    @ApiProperty({
        example: 'john@example.com',
    })
    @IsEmail()
    email!: string;

    @ApiProperty({
        example: 'Password@123',
        minLength: 8,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password!: string;
}
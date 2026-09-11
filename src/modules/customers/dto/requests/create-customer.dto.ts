import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

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
    @IsPhoneNumber()
    @ApiPropertyOptional({
        description: 'The phone number of the customer',
        example: '+8801712345678',
    })
    phone?: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(100)
    @ApiProperty({
        description: 'The password of the customer',
        example: 'Password123!',
    })
    password!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    @ApiPropertyOptional({
        description: 'The address of the customer',
        example: 'Dhaka, Bangladesh',
    })
    address?: string;
}
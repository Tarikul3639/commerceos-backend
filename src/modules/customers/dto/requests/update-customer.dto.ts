import {
    IsEmail,
    IsOptional,
    IsPhoneNumber,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

import {
    ApiPropertyOptional,
} from '@nestjs/swagger';

export class UpdateCustomerDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    @ApiPropertyOptional({
        description: 'The full name of the customer',
        example: 'John Doe',
    })
    name?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    @ApiPropertyOptional({
        description: 'The email address of the customer',
        example: 'customer@example.com',
    })
    email?: string;

    @IsOptional()
    @IsPhoneNumber()
    @ApiPropertyOptional({
        description: 'The phone number of the customer',
        example: '+8801712345678',
    })
    phone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    @ApiPropertyOptional({
        description: 'The address of the customer',
        example: 'Dhaka, Bangladesh',
    })
    address?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';

import {
    IsBoolean,
    IsEmail,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class UpdateSupplierDto {
    @ApiPropertyOptional({
        example: 'ABC Trading Limited',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiPropertyOptional({
        example: 'contact@abctrading.com',
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        example: '+8801712345678',
    })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    phone?: string;

    @ApiPropertyOptional({
        example: 'Dhaka, Bangladesh',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    address?: string;

    @ApiPropertyOptional({
        example: 'John Doe',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    contactPerson?: string;

    @ApiPropertyOptional({
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
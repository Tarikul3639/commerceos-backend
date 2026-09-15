import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

export class UpdateSettingsDto {
    @ApiPropertyOptional({
        example: 'CommerceOS',
    })
    @IsOptional()
    @IsString()
    @MinLength(1)
    companyName?: string;

    @ApiPropertyOptional({
        example: 'admin@example.com',
    })
    @IsOptional()
    @IsEmail()
    companyEmail?: string;

    @ApiPropertyOptional({
        example: '+8801712345678',
    })
    @IsOptional()
    @IsString()
    companyPhone?: string;

    @ApiPropertyOptional({
        example: 'Dhaka, Bangladesh',
    })
    @IsOptional()
    @IsString()
    companyAddress?: string;

    @ApiPropertyOptional({
        example: 'https://cdn.example.com/logo.png',
        nullable: true,
    })
    @IsOptional()
    @IsString()
    logo?: string | null;

    @ApiPropertyOptional({
        example: 'https://cdn.example.com/favicon.ico',
        nullable: true,
    })
    @IsOptional()
    @IsString()
    favicon?: string | null;

    @ApiPropertyOptional({
        example: 'BDT',
    })
    @IsOptional()
    @IsString()
    currency?: string;

    @ApiPropertyOptional({
        example: 'Asia/Dhaka',
    })
    @IsOptional()
    @IsString()
    timezone?: string;
}
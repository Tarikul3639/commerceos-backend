import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
} from 'class-validator';

import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateBrandDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    @ApiProperty({
        description: 'The name of the brand',
        example: 'Nike',
    })
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    @ApiPropertyOptional({
        description: 'Description of the brand',
        example: 'Nike is a global sportswear brand',
    })
    description?: string;

    @IsOptional()
    @IsUrl()
    @MaxLength(500)
    @ApiPropertyOptional({
        description: 'Brand image URL',
        example: 'https://example.com/brands/nike.jpg',
    })
    image?: string;

    @IsOptional()
    @ApiPropertyOptional({
        description: 'Whether the brand is active',
        example: true,
        default: true,
    })
    isActive?: boolean;
}
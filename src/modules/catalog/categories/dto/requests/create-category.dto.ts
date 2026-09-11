import {
    IsBoolean,
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

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    @ApiProperty({
        description: 'The name of the category',
        example: 'Electronics',
    })
    name!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(150)
    @ApiProperty({
        description: 'The unique URL-friendly slug of the category',
        example: 'electronics',
    })
    slug!: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    @ApiPropertyOptional({
        description: 'The description of the category',
        example: 'Electronic devices and accessories',
    })
    description?: string;

    @IsOptional()
    @IsUrl()
    @MaxLength(500)
    @ApiPropertyOptional({
        description: 'Cloudinary image URL',
        example:
            'https://res.cloudinary.com/example/image/upload/categories/electronics.jpg',
    })
    image?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    @ApiPropertyOptional({
        description: 'Cloudinary public ID used to manage and delete the image',
        example: 'categories/electronics',
    })
    publicId?: string;

    @IsOptional()
    @IsBoolean()
    @ApiPropertyOptional({
        description: 'Controls whether the category is active',
        example: true,
        default: true,
    })
    isActive?: boolean;
}
import {
    IsInt,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductImageDto {
    @ApiPropertyOptional({
        example:
            'https://res.cloudinary.com/demo/image/upload/updated-image.jpg',
    })
    @IsOptional()
    @IsString()
    imageUrl?: string;

    @ApiPropertyOptional({
        example: 'products/updated-product-image',
    })
    @IsOptional()
    @IsString()
    publicId?: string;

    @ApiPropertyOptional({
        example: 1,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
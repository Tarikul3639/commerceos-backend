
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsInt,
    IsOptional,
    IsString,
    IsUrl,
    Min,
} from 'class-validator';

export class UpdateProductImageDto {
    @ApiPropertyOptional({
        example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        description: 'Updated product image URL',
    })
    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @ApiPropertyOptional({
        example: 'products/sample-image',
        description: 'Updated Cloudinary public ID',
    })
    @IsOptional()
    @IsString()
    publicId?: string;

    @ApiPropertyOptional({
        example: 1,
        minimum: 0,
        description: 'Updated image display order',
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}

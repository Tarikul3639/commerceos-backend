import {
    IsInt,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductImageDto {
    @ApiProperty({
        example: 'cmf123456789',
    })
    @IsString()
    id!: string;

    @ApiProperty({
        example:
            'https://res.cloudinary.com/demo/image/upload/updated-image.jpg',
    })
    @IsOptional()
    @IsString()
    imageUrl?: string;

    @ApiProperty({
        example: 'products/updated-product-image',
    })
    @IsOptional()
    @IsString()
    publicId?: string;

    @ApiProperty({
        example: 1,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsInt,
    IsNotEmpty,
    IsString,
    IsUrl,
    Min,
    ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class ProductImageItemDto {
    @ApiProperty({
        example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        description: 'Cloudinary image URL',
    })
    @IsString()
    @IsNotEmpty()
    @IsUrl()
    imageUrl!: string;

    @ApiProperty({
        example: 'products/sample-image',
        description: 'Cloudinary public ID',
    })
    @IsString()
    @IsNotEmpty()
    publicId!: string;

    @ApiProperty({
        example: 0,
        minimum: 0,
        description: 'Image display order',
    })
    @IsInt()
    @Min(0)
    sortOrder!: number;
}

export class AddProductImageDto {
    @ApiProperty({
        example: 'cm123product456',
        description: 'Product ID',
    })
    @IsString()
    @IsNotEmpty()
    productId!: string;

    @ApiProperty({
        type: [ProductImageItemDto],
        description: 'Array of product images',
        example: [
            {
                imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample-1.jpg',
                publicId: 'products/sample-1',
                sortOrder: 0,
            },
            {
                imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample-2.jpg',
                publicId: 'products/sample-2',
                sortOrder: 1,
            },
        ],
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ProductImageItemDto)
    images!: ProductImageItemDto[];
}

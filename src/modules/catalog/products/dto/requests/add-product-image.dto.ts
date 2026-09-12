import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

export class AddProductImageDto {
    @ApiProperty({
        example:
            'https://res.cloudinary.com/demo/image/upload/product-image.jpg',
    })
    @IsString()
    @IsNotEmpty()
    imageUrl!: string;

    @ApiProperty({
        example: 'products/product-image',
    })
    @IsString()
    @IsNotEmpty()
    publicId!: string;

    @ApiPropertyOptional({
        example: 0,
        default: 0,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
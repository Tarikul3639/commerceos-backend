import { ApiProperty } from '@nestjs/swagger';

export class ProductImageResponseDto {
    @ApiProperty({
        example: 'cmf123456789',
    })
    id!: string;

    @ApiProperty({
        example:
            'https://res.cloudinary.com/demo/image/upload/product.jpg',
    })
    imageUrl!: string;

    @ApiProperty({
        example: 'products/product-image',
    })
    publicId!: string;

    @ApiProperty({
        example: 0,
    })
    sortOrder!: number;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
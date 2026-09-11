import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

export class CategoryResponseDto {
    @ApiProperty({
        example: 'cmf123456789',
    })
    id!: string;

    @ApiProperty({
        example: 'Electronics',
    })
    name!: string;

    @ApiProperty({
        example: 'electronics',
    })
    slug!: string;

    @ApiPropertyOptional({
        example: 'Electronic devices and accessories',
        nullable: true,
    })
    description!: string | null;

    @ApiPropertyOptional({
        example:
            'https://res.cloudinary.com/example/image/upload/categories/electronics.jpg',
        nullable: true,
    })
    image!: string | null;

    @ApiPropertyOptional({
        example: 'categories/electronics',
        nullable: true,
    })
    publicId!: string | null;

    @ApiProperty({
        example: true,
    })
    isActive!: boolean;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
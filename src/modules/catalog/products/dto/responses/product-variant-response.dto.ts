import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductVariantResponseDto {
    @ApiProperty({
        example: 'cmf123456789',
    })
    id!: string;

    @ApiProperty({
        example: 'TSHIRT-RED-M',
    })
    sku!: string;

    @ApiProperty({
        example: '1234567890123',
        nullable: true,
    })
    barcode!: string | null;

    @ApiPropertyOptional({ example: 'Red', nullable: true })
    color!: string | null;

    @ApiPropertyOptional({ example: '#FF0000', nullable: true })
    colorHex!: string | null;

    @ApiPropertyOptional({ example: 'M', nullable: true })
    size!: string | null;

    @ApiProperty({
        example:
            'https://res.cloudinary.com/demo/image/upload/variant.jpg',
        nullable: true,
    })
    image!: string | null;

    @ApiProperty({
        example: 'products/variants/tshirt-red-m',
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
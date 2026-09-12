import { ApiProperty } from '@nestjs/swagger';

export class VariantAttributeResponseDto {
    @ApiProperty({
        example: 'cmf123attributeid',
    })
    attributeId!: string;

    @ApiProperty({
        example: 'Color',
    })
    attributeName!: string;

    @ApiProperty({
        example: 'cmf123attributevalueid',
    })
    attributeValueId!: string;

    @ApiProperty({
        example: 'Red',
    })
    attributeValue!: string;
}

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

    @ApiProperty({
        example: '500',
    })
    purchasePrice!: string;

    @ApiProperty({
        example: '750',
    })
    sellingPrice!: string;

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

    @ApiProperty({
        type: [VariantAttributeResponseDto],
    })
    attributes!: VariantAttributeResponseDto[];

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
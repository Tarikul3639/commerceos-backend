import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CartProductResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    slug!: string;
}

export class CartVariantResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    sku!: string;

    @ApiProperty()
    price!: string;

    @ApiPropertyOptional({
        nullable: true,
    })
    imageUrl!: string | null;

    @ApiProperty({
        type: CartProductResponseDto,
    })
    product!: CartProductResponseDto;
}

export class CartItemResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    quantity!: number;

    @ApiProperty()
    variantId!: string;

    @ApiProperty({
        type: CartVariantResponseDto,
    })
    variant!: CartVariantResponseDto;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

export class CartResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    customerId!: string;

    @ApiProperty({
        type: [CartItemResponseDto],
    })
    items!: CartItemResponseDto[];

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
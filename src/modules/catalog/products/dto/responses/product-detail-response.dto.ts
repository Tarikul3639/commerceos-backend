import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ProductBrandResponseDto, ProductCategoryResponseDto } from './product-response.dto';
import { ProductImageResponseDto } from './product-image-response.dto';

export class ProductDetailResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    slug!: string;

    @ApiProperty()
    sku!: string;

    @ApiPropertyOptional({ nullable: true })
    barcode!: string | null;

    @ApiPropertyOptional({ nullable: true })
    description!: string | null;

    @ApiProperty()
    purchasePrice!: string;

    @ApiProperty()
    sellingPrice!: string;

    @ApiProperty()
    stock!: number;

    @ApiProperty({ type: [String] })
    sizes!: string[];

    @ApiPropertyOptional({ nullable: true })
    colors!: unknown;

    @ApiProperty()
    isActive!: boolean;

    @ApiProperty({ type: ProductCategoryResponseDto })
    category!: ProductCategoryResponseDto;

    @ApiPropertyOptional({
        type: ProductBrandResponseDto,
        nullable: true,
    })
    brand!: ProductBrandResponseDto | null;

    @ApiProperty({ type: [ProductImageResponseDto] })
    images!: ProductImageResponseDto[];

    @ApiProperty({ type: [Object] })
    discounts!: unknown[];

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
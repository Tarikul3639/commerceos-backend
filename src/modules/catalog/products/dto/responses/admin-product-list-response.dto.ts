import { ApiProperty } from '@nestjs/swagger';

import { ProductStatus } from '@/lib/prisma/enums';

export class AdminProductListItemDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty({ nullable: true })
    subDescription!: string | null;

    @ApiProperty()
    purchasePrice!: string;

    @ApiProperty()
    sellingPrice!: string;

    @ApiProperty({ enum: ProductStatus, enumName: 'ProductStatus' })
    status!: ProductStatus;

    @ApiProperty()
    categoryId!: string;

    @ApiProperty({ nullable: true })
    brandId!: string | null;

    @ApiProperty({ nullable: true })
    sizeGuideId!: string | null;

    @ApiProperty({ nullable: true, type: String, format: 'date-time' })
    deletedAt!: Date | null;

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt!: Date;

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt!: Date;
}

export class AdminProductListResponseDto {
    @ApiProperty({ type: [AdminProductListItemDto] })
    data!: AdminProductListItemDto[];

    @ApiProperty()
    total!: number;

    @ApiProperty()
    page!: number;

    @ApiProperty()
    limit!: number;

    @ApiProperty()
    totalPages!: number;
}
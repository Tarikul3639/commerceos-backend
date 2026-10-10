import { ApiProperty } from '@nestjs/swagger';

import { ProductStatus } from '@/lib/prisma/enums';

export class AdminProductImageDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    imageUrl!: string;

    @ApiProperty()
    publicId!: string;

    @ApiProperty()
    sortOrder!: number;
}

export class AdminProductDetailResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty({ nullable: true })
    subDescription!: string | null;

    @ApiProperty({ nullable: true })
    description!: string | null;

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

    @ApiProperty({ type: [AdminProductImageDto] })
    images!: AdminProductImageDto[];

    @ApiProperty({ nullable: true, type: String, format: 'date-time' })
    deletedAt!: Date | null;

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt!: Date;

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt!: Date;
}
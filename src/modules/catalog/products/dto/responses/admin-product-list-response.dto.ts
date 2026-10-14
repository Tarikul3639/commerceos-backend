import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '@/lib/prisma/enums';
import { PaginationMetaDto } from "@/common/dto/responses/pagination-meta.dto"

/** Common relation summary */
export class RelationSummaryDto {
    @ApiProperty({
        example: 'cm123abc456',
        description: 'Relation ID',
    })
    id!: string;

    @ApiProperty({
        example: 'Panjabi',
        description: 'Relation name',
    })
    name!: string;
}

/** Admin product list item */
export class AdminProductListItemDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty({
        example: 'https://res.cloudinary.com/demo/image/upload/product.jpg',
        nullable: true,
        description: 'Primary product image URL',
    })
    image!: string | null;

    @ApiProperty({ nullable: true })
    subDescription!: string | null;

    @ApiProperty({ example: '850.00' })
    purchasePrice!: string;

    @ApiProperty({ example: '1290.00' })
    sellingPrice!: string;

    @ApiProperty({ enum: ProductStatus, enumName: 'ProductStatus' })
    status!: ProductStatus;

    @ApiProperty({ type: RelationSummaryDto })
    category!: RelationSummaryDto;

    @ApiProperty({
        type: RelationSummaryDto,
        nullable: true,
    })
    brand!: RelationSummaryDto | null;

    @ApiProperty({
        type: RelationSummaryDto,
        nullable: true,
    })
    sizeGuide!: RelationSummaryDto | null;

    @ApiProperty({ nullable: true, type: String, format: 'date-time' })
    deletedAt!: Date | null;

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt!: Date;

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt!: Date;
}

/** Admin product list response */
export class AdminProductListResponseDto {
    @ApiProperty({ type: [AdminProductListItemDto] })
    data!: AdminProductListItemDto[];

    @ApiProperty({ type: PaginationMetaDto })
    meta!: PaginationMetaDto;
}
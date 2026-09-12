import { ApiProperty } from '@nestjs/swagger';

export class BrandResponseDto {
    @ApiProperty({
        example: 'cmf123456789',
    })
    id!: string;

    @ApiProperty({
        example: 'Nike',
    })
    name!: string;

    @ApiProperty({
        example: 'nike',
    })
    slug!: string;

    @ApiProperty({
        example: 'Nike is a global sportswear brand',
        nullable: true,
    })
    description!: string | null;

    @ApiProperty({
        example: 'https://example.com/brands/nike.jpg',
        nullable: true,
    })
    image!: string | null;

    @ApiProperty({
        example: true,
    })
    isActive!: boolean;

    @ApiProperty({
        example: '2026-09-12T10:30:00.000Z',
        type: String,
        format: 'date-time',
    })
    createdAt!: Date;

    @ApiProperty({
        example: '2026-09-12T10:30:00.000Z',
        type: String,
        format: 'date-time',
    })
    updatedAt!: Date;
}
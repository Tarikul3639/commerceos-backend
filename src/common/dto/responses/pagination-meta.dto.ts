import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
    @ApiProperty({
        example: 50,
        description: 'Total number of records',
    })
    total!: number;

    @ApiProperty({
        example: 1,
        description: 'Current page number',
    })
    page!: number;

    @ApiProperty({
        example: 10,
        description: 'Number of records per page',
    })
    limit!: number;

    @ApiProperty({
        example: 5,
        description: 'Total number of pages',
    })
    totalPages!: number;

    @ApiProperty({
        example: true,
        description: 'Indicates whether a next page exists',
    })
    hasNextPage!: boolean;

    @ApiProperty({
        example: false,
        description: 'Indicates whether a previous page exists',
    })
    hasPreviousPage!: boolean;
}
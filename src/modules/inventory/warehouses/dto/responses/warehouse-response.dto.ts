import { ApiProperty } from '@nestjs/swagger';

export class WarehouseResponseDto {
    @ApiProperty({
        example: '1',
    })
    id!: string;

    @ApiProperty({
        example: 'Main Warehouse',
    })
    name!: string;

    @ApiProperty({
        example: 'Dhaka, Bangladesh',
        nullable: true,
    })
    address!: string | null;

    @ApiProperty({
        example: true,
    })
    isActive!: boolean;

    @ApiProperty({
        example: '2023-01-01T00:00:00.000Z',
    })
    createdAt!: Date;

    @ApiProperty({
        example: '2023-01-01T00:00:00.000Z',
    })
    updatedAt!: Date;
}
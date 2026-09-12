import { ApiProperty } from '@nestjs/swagger';

export class AttributeValueResponseDto {
    @ApiProperty({
        example: 'cmf123456789',
    })
    id!: string;

    @ApiProperty({
        example: 'Red',
    })
    value!: string;

    @ApiProperty({
        example: 5,
    })
    minimumStock!: number;

    @ApiProperty({
        example: 'cmf987654321',
    })
    attributeId!: string;

    @ApiProperty({
        example: '2026-09-13T10:30:00.000Z',
        type: String,
        format: 'date-time',
    })
    createdAt!: Date;

    @ApiProperty({
        example: '2026-09-13T10:30:00.000Z',
        type: String,
        format: 'date-time',
    })
    updatedAt!: Date;
}
import { ApiProperty } from '@nestjs/swagger';

import { AttributeValueResponseDto } from './attribute-value-response.dto';

export class AttributeResponseDto {
    @ApiProperty({
        example: 'cmf123456789',
    })
    id!: string;

    @ApiProperty({
        example: 'Color',
    })
    name!: string;

    @ApiProperty({
        type: [AttributeValueResponseDto],
    })
    values!: AttributeValueResponseDto[];

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
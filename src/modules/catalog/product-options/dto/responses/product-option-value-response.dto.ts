
import { ApiProperty } from '@nestjs/swagger';

export class ProductOptionValueResponseDto {
    @ApiProperty({ example: 'cm123redvalue' })
    id!: string;

    @ApiProperty({ example: 'Red' })
    value!: string;

    @ApiProperty({
        example: '#FF0000',
        nullable: true,
    })
    colorHex!: string | null;

    @ApiProperty({ example: 'cm123coloroption' })
    optionId!: string;

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt!: Date;

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt!: Date;
}

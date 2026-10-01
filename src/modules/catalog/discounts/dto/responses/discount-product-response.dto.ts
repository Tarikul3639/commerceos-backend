import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

export class DiscountProductResponseDto {
    @ApiProperty({
        example: 'cmfproduct123',
    })
    id!: string;

    @ApiProperty({
        example: 'iPhone 15',
    })
    name!: string;

    @ApiProperty({
        example: 'iphone-15',
    })
    slug!: string;

    @ApiPropertyOptional({
        example: [
            'https://example.com/iphone-15-1.jpg',
            'https://example.com/iphone-15-2.jpg',
        ],
        nullable: true,
        type: [String],
    })
    images!: string[] | null;
}

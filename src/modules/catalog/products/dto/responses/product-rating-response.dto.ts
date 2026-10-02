import { ApiProperty } from '@nestjs/swagger';

export class ProductRatingResponseDto {
    @ApiProperty({
        example: 4.5,
    })
    average!: number;

    @ApiProperty({
        example: 24,
    })
    count!: number;
}
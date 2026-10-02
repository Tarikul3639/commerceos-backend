import { ApiProperty } from '@nestjs/swagger';

export class ProductReviewResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty({ example: 5 })
    rating!: number;

    @ApiProperty({ nullable: true })
    comment!: string | null;

    @ApiProperty()
    customerId!: string;

    @ApiProperty({
        nullable: true,
        example: 'https://res.cloudinary.com/demo/image/upload/avatar.jpg',
    })
    avatarUrl!: string | null;

    @ApiProperty()
    createdAt!: Date;
}
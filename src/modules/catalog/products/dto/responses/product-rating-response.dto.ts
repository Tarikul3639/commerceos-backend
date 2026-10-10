import { ApiProperty } from '@nestjs/swagger';

export class ProductRatingResponseDto {
  @ApiProperty() productId!: string;
  @ApiProperty() rating!: number;
  @ApiProperty() reviewCount!: number;
}

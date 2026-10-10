import { ApiProperty } from '@nestjs/swagger';

export class ProductImageResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() imageUrl!: string;
  @ApiProperty() publicId!: string;
  @ApiProperty() sortOrder!: number;
  @ApiProperty() productId!: string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

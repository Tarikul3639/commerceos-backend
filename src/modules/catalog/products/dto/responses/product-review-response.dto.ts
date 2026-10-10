import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductReviewResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() productId!: string;
  @ApiProperty() customerId!: string;
  @ApiProperty() rating!: number;
  @ApiPropertyOptional({ nullable: true }) comment!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

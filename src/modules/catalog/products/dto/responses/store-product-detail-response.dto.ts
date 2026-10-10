import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StoreProductDetailResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiProperty() sellingPrice!: string;
  @ApiProperty({ type: [String] }) images!: string[];
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminProductDetailResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiPropertyOptional({ nullable: true }) subDescription!: string | null;
  @ApiProperty() purchasePrice!: string;
  @ApiProperty() sellingPrice!: string;
  @ApiProperty() status!: string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

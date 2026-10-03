import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../../../common/dto/responses/pagination-meta.dto';

export class DiscountProductDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() sku!: string;
  @ApiPropertyOptional({ nullable: true }) image!: string | null;
}

export class DiscountCreatorDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
}

export class DiscountResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: '20' }) value!: string;
  @ApiPropertyOptional({ nullable: true }) startDate!: Date | null;
  @ApiPropertyOptional({ nullable: true }) endDate!: Date | null;
  @ApiProperty() productId!: string;
  @ApiProperty({ type: DiscountProductDto }) product!: DiscountProductDto;
  @ApiProperty() createdById!: string;
  @ApiProperty({ type: DiscountCreatorDto }) createdBy!: DiscountCreatorDto;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class DiscountResponseWithPaginationDto {
  @ApiProperty({ type: [DiscountResponseDto] }) data!: DiscountResponseDto[];
  @ApiProperty({ type: PaginationMetaDto }) meta!: PaginationMetaDto;
}

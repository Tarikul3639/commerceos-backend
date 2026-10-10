import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminProductListMetaDto {
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() totalPages!: number;
  @ApiProperty() hasNextPage!: boolean;
  @ApiProperty() hasPreviousPage!: boolean;
}

export class AdminProductListItemDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiProperty() sellingPrice!: string;
  @ApiProperty() status!: string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class AdminProductListResponseDto {
  @ApiProperty({ type: [AdminProductListItemDto] }) data!: AdminProductListItemDto[];
  @ApiProperty({ type: AdminProductListMetaDto }) meta!: AdminProductListMetaDto;
}

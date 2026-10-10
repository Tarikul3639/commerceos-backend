import { ApiProperty } from '@nestjs/swagger';

export class StoreProductListItemDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() sellingPrice!: string;
  @ApiProperty({ nullable: true }) imageUrl!: string | null;
}

export class StoreProductListResponseDto {
  @ApiProperty({ type: [StoreProductListItemDto] }) data!: StoreProductListItemDto[];
}

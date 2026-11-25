import { ApiProperty } from '@nestjs/swagger';

export class StoreCartStockItemResponseDto {
  @ApiProperty()
  productId!: string;

  @ApiProperty({ type: String, nullable: true })
  variantId!: string | null;

  @ApiProperty({ minimum: 0 })
  stock!: number;
}

export class StoreCartStockResponseDto {
  @ApiProperty({ type: [StoreCartStockItemResponseDto] })
  items!: StoreCartStockItemResponseDto[];
}

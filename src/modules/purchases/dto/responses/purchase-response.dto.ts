import { ApiProperty } from '@nestjs/swagger';

export class PurchaseItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unitPrice!: string;

  @ApiProperty()
  subtotal!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  product!: {
    id: string;
    name: string;
    sku: string;
  };

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class SupplierResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class PurchaseUserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;
}

export class PurchaseResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  invoiceNo!: string;

  @ApiProperty()
  subtotal!: string;

  @ApiProperty()
  discount!: string;

  @ApiProperty()
  tax!: string;

  @ApiProperty()
  total!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  supplier!: SupplierResponseDto;

  @ApiProperty()
  user!: PurchaseUserResponseDto;

  @ApiProperty({ type: [PurchaseItemResponseDto] })
  items!: PurchaseItemResponseDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

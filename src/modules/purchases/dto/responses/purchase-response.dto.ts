import { ApiProperty } from '@nestjs/swagger';

export class PurchaseItemResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    quantity!: number;

    @ApiProperty({
        example: '500.00',
    })
    unitPrice!: string;

    @ApiProperty({
        example: '5000.00',
    })
    subtotal!: string;

    @ApiProperty()
    variantId!: string;

    @ApiProperty()
    variant!: {
        id: string;
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

export class WarehouseResponseDto {
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

    @ApiProperty({
        example: 'PUR-20260913-0001',
    })
    invoiceNo!: string;

    @ApiProperty({
        example: '5000.00',
    })
    subtotal!: string;

    @ApiProperty({
        example: '100.00',
    })
    discount!: string;

    @ApiProperty({
        example: '50.00',
    })
    tax!: string;

    @ApiProperty({
        example: '4950.00',
    })
    total!: string;

    @ApiProperty({
        example: 'PENDING',
    })
    status!: string;

    @ApiProperty()
    supplier!: SupplierResponseDto;

    @ApiProperty()
    warehouse!: WarehouseResponseDto;

    @ApiProperty()
    user!: PurchaseUserResponseDto;

    @ApiProperty({
        type: [PurchaseItemResponseDto],
    })
    items!: PurchaseItemResponseDto[];

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
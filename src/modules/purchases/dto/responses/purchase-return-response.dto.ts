import { ApiProperty } from '@nestjs/swagger';

export class PurchaseReturnItemResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    quantity!: number;

    @ApiProperty({
        nullable: true,
    })
    reason!: string | null;

    @ApiProperty()
    purchaseItem!: {
        id: string;
        quantity: number;
        unitPrice: string;

        variant: {
            id: string;
            sku: string;
        };
    };

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

export class PurchaseReturnCreatedByResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    email!: string;
}

export class PurchaseReturnApprovedByResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    email!: string;
}

export class PurchaseReturnPurchaseResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    invoiceNo!: string;
}

export class PurchaseReturnResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty({
        example: 'PRET-20260913-0001',
    })
    returnNo!: string;

    @ApiProperty({
        example: 'PENDING',
    })
    status!: string;

    @ApiProperty({
        nullable: true,
    })
    reason!: string | null;

    @ApiProperty()
    purchase!: PurchaseReturnPurchaseResponseDto;

    @ApiProperty({
        type: [PurchaseReturnItemResponseDto],
    })
    items!: PurchaseReturnItemResponseDto[];

    @ApiProperty()
    createdBy!: PurchaseReturnCreatedByResponseDto;

    @ApiProperty({
        nullable: true,
        required: false,
    })
    approvedBy!: PurchaseReturnApprovedByResponseDto | null;

    @ApiProperty({
        nullable: true,
        required: false,
    })
    approvedAt!: Date | null;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
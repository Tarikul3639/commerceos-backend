import {
    ApiProperty,
} from '@nestjs/swagger';

export class OrderReturnItemResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    quantity!: number;

    @ApiProperty({
        nullable: true,
    })
    reason!: string | null;

    @ApiProperty()
    orderItemId!: string;

    @ApiProperty()
    orderItem!: {
        id: string;

        quantity: number;

        variant: {
            id: string;
            sku: string;

            product: {
                id: string;
                name: string;
                slug: string;
            };
        };
    };

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

export class OrderReturnCreatedByResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    email!: string;
}

export class OrderReturnApprovedByResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    email!: string;
}

export class OrderReturnOrderResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    invoiceNo!: string;

    @ApiProperty()
    customer!: {
        id: string;
        name: string;
    };
}

export class OrderReturnResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty({
        example: 'RET-20260914-0001',
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
    order!: OrderReturnOrderResponseDto;

    @ApiProperty({
        type: [OrderReturnItemResponseDto],
    })
    items!: OrderReturnItemResponseDto[];

    @ApiProperty()
    createdBy!: OrderReturnCreatedByResponseDto;

    @ApiProperty({
        nullable: true,
    })
    approvedBy!: OrderReturnApprovedByResponseDto | null;

    @ApiProperty({
        nullable: true,
    })
    approvedAt!: Date | null;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
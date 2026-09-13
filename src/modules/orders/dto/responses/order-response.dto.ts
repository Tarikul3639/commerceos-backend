import {
    ApiProperty,
} from '@nestjs/swagger';

export class OrderItemResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    quantity!: number;

    @ApiProperty({
        example: '500.00',
    })
    unitPrice!: string;

    @ApiProperty({
        example: '1000.00',
    })
    subtotal!: string;

    @ApiProperty()
    variantId!: string;

    @ApiProperty()
    variant!: {
        id: string;
        sku: string;

        product: {
            id: string;
            name: string;
            slug: string;
        };
    };

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

export class OrderCustomerResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;
}

export class OrderWarehouseResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;
}

export class OrderUserResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    email!: string;
}

export class OrderResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty({
        example: 'ORD-20260914-0001',
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
    paymentStatus!: string;

    @ApiProperty({
        example: 'PENDING',
    })
    status!: string;

    @ApiProperty()
    customer!: OrderCustomerResponseDto;

    @ApiProperty()
    warehouse!: OrderWarehouseResponseDto;

    @ApiProperty()
    user!: OrderUserResponseDto;

    @ApiProperty({
        type: [OrderItemResponseDto],
    })
    items!: OrderItemResponseDto[];

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponseDto {
    @ApiProperty() id!: string;
    @ApiProperty() quantity!: number;
    @ApiProperty() unitPrice!: string;
    @ApiProperty() subtotal!: string;
    @ApiProperty() productId!: string;
    @ApiProperty() product!: { id: string; name: string; sku: string };
    @ApiProperty() createdAt!: Date;
    @ApiProperty() updatedAt!: Date;
}

export class OrderCustomerResponseDto {
    @ApiProperty() id!: string;
    @ApiProperty() name!: string;
}

export class OrderUserResponseDto {
    @ApiProperty() id!: string;
    @ApiProperty() name!: string;
    @ApiProperty() email!: string;
}

export class OrderResponseDto {
    @ApiProperty() id!: string;
    @ApiProperty() invoiceNo!: string;
    @ApiProperty() subtotal!: string;
    @ApiProperty() discount!: string;
    @ApiProperty() tax!: string;
    @ApiProperty() total!: string;
    @ApiProperty() paymentStatus!: string;
    @ApiProperty() status!: string;
    @ApiProperty() customer!: OrderCustomerResponseDto;
    @ApiProperty() user!: OrderUserResponseDto;
    @ApiProperty({ type: [OrderItemResponseDto] }) items!: OrderItemResponseDto[];
    @ApiProperty() createdAt!: Date;
    @ApiProperty() updatedAt!: Date;
}

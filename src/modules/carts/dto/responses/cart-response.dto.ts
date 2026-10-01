import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CartProductResponseDto {
    @ApiProperty() id!: string;
    @ApiProperty() name!: string;
    @ApiProperty() slug!: string;
    @ApiProperty() sku!: string;
    @ApiProperty() price!: string;
    @ApiPropertyOptional({ nullable: true }) imageUrl!: string | null;
}

export class CartItemResponseDto {
    @ApiProperty() id!: string;
    @ApiProperty() quantity!: number;
    @ApiProperty() productId!: string;
    @ApiProperty({ type: CartProductResponseDto }) product!: CartProductResponseDto;
    @ApiProperty() createdAt!: Date;
    @ApiProperty() updatedAt!: Date;
}

export class CartResponseDto {
    @ApiProperty() id!: string;
    @ApiProperty() customerId!: string;
    @ApiProperty({ type: [CartItemResponseDto] }) items!: CartItemResponseDto[];
    @ApiProperty() createdAt!: Date;
    @ApiProperty() updatedAt!: Date;
}

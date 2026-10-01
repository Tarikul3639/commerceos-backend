import { IsArray, IsInt, IsNotEmpty, IsNumberString, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePurchaseItemDto {
    @ApiProperty({ example: 'cmf123productid', description: 'Product ID' })
    @IsString() @IsNotEmpty()
    productId!: string;

    @ApiProperty({ example: 10, minimum: 1 })
    @Type(() => Number) @IsInt() @Min(1)
    quantity!: number;

    @ApiProperty({ example: '500.00' })
    @IsNumberString()
    unitPrice!: string;
}

export class CreatePurchaseDto {
    @ApiProperty({ example: 'cmf123supplierid' })
    @IsString() @IsNotEmpty()
    supplierId!: string;

    @ApiProperty({ type: [CreatePurchaseItemDto] })
    @IsArray() @ValidateNested({ each: true }) @Type(() => CreatePurchaseItemDto)
    items!: CreatePurchaseItemDto[];

    @ApiProperty({ required: false, default: '0' })
    @IsNumberString()
    discount?: string;

    @ApiProperty({ required: false, default: '0' })
    @IsNumberString()
    tax?: string;
}

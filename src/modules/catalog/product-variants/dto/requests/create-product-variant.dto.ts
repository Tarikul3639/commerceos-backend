import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateProductVariantDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 'TSHIRT-BLACK-M' })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiPropertyOptional({ example: '8901234567895', nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  barcode?: string | null;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string' },
    example: { colorOptionId: 'blackValueId', sizeOptionId: 'mediumValueId' },
  })
  @IsObject()
  options!: Record<string, string>;
}

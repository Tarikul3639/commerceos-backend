import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GeneratedVariantDto {
  @ApiProperty({ example: 'TSHIRT-BLACK-M' })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiProperty({ example: '8901234567895' })
  @IsString()
  @IsNotEmpty()
  barcode!: string;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } })
  @IsObject()
  options!: Record<string, string>;
}

export class GenerateProductVariantsDto {
  @ApiProperty({ type: [GeneratedVariantDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GeneratedVariantDto)
  variants!: GeneratedVariantDto[];
}

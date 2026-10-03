import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductImageDto {
  @ApiPropertyOptional({ example: 'cmf123456789' })
  @ValidateIf((image: UpdateProductImageDto) => image.id !== undefined)
  @IsString()
  @IsNotEmpty()
  id?: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/updated-image.jpg',
  })
  @ValidateIf((image: UpdateProductImageDto) => image.id === undefined)
  @IsString()
  @IsNotEmpty()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'products/updated-product-image' })
  @ValidateIf((image: UpdateProductImageDto) => image.id === undefined)
  @IsString()
  @IsNotEmpty()
  publicId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

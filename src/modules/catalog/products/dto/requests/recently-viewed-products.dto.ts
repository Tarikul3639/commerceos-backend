import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class RecentlyViewedProductsDto {
  @ApiProperty({
    type: [String],
    example: ['cm123product456', 'cm123product789'],
    maxItems: 20,
    description: 'Product IDs ordered from most recently viewed to oldest',
  })
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  productIds!: string[];
}

import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ProductSearchQueryDto {
  @ApiProperty({
    example: 'wireless mouse',
    description: 'Search published storefront products by name or details',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : ''))
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  q!: string;
}

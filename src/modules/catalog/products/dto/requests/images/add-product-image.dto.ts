import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AddProductImageDto {
  @ApiProperty({ example: 'https://cdn.example.com/images/1.jpg' })
  @IsString()
  @IsNotEmpty()
  imageUrl!: string;

  @ApiProperty({ example: 'product-1-image-1' })
  @IsString()
  @IsNotEmpty()
  publicId!: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

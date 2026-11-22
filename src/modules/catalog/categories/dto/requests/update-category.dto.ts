import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @ApiPropertyOptional({
    example: 'Electronics',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  @ApiPropertyOptional({
    example: 'electronics',
  })
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiPropertyOptional({
    example: 'Electronic devices and accessories',
  })
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/category.jpg',
  })
  image?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiPropertyOptional({
    description: 'Cloudinary public ID for the category image',
  })
  publicId?: string | null;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    example: true,
  })
  isActive?: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class SearchQueryDto {
  @ApiProperty({ example: 'wireless mouse', description: 'Search term' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  q!: string;
}

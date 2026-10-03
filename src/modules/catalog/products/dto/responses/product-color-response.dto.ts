import { ApiProperty } from '@nestjs/swagger';

export class ProductColorResponseDto {
  @ApiProperty({
    example: 'Red',
  })
  name!: string;

  @ApiProperty({
    example: '#FF0000',
  })
  hex!: string;
}

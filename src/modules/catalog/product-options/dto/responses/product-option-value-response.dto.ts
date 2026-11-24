import { ApiProperty } from '@nestjs/swagger';

export class ProductOptionValueResponseDto {
  @ApiProperty({ example: 'v1' })
  id!: string;

  @ApiProperty({ example: 'Black' })
  label!: string;

  @ApiProperty({ example: '#000000', nullable: true })
  colorCode!: string | null;
}

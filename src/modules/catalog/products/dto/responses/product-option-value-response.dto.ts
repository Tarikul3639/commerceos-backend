import { ApiProperty } from '@nestjs/swagger';

export class ProductOptionValueResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() value!: string;
  @ApiProperty({ nullable: true }) colorHex!: string | null;
}

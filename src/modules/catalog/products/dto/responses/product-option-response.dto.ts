import { ApiProperty } from '@nestjs/swagger';

export class ProductOptionResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() type!: string;
  @ApiProperty({ type: [String] }) values!: string[];
}

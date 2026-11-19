import { ApiProperty } from '@nestjs/swagger';

export class ShippingZoneResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() districtCity!: string;
  @ApiProperty() rate!: string;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class ShippingSettingsResponseDto {
  @ApiProperty({ nullable: true, type: Number }) freeShippingThreshold!:
    string | null;
  @ApiProperty({ type: [ShippingZoneResponseDto] })
  zones!: ShippingZoneResponseDto[];
}

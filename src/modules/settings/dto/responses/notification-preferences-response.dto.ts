import { ApiProperty } from '@nestjs/swagger';

export class NotificationPreferencesResponseDto {
  @ApiProperty() ordersInApp!: boolean;
  @ApiProperty() ordersEmail!: boolean;
  @ApiProperty() returnsInApp!: boolean;
  @ApiProperty() returnsEmail!: boolean;
  @ApiProperty() inventoryInApp!: boolean;
  @ApiProperty() inventoryEmail!: boolean;
  @ApiProperty() paymentsInApp!: boolean;
  @ApiProperty() paymentsEmail!: boolean;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

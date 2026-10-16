import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentOrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  invoiceNo!: string;

  @ApiProperty()
  total!: string;

  @ApiProperty()
  paymentStatus!: string;
}

export class PaymentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orderId!: string;

  @ApiProperty()
  amount!: string;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  method!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  type!: string;

  @ApiPropertyOptional({ nullable: true })
  transactionId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  notes!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ type: () => PaymentOrderResponseDto })
  order?: PaymentOrderResponseDto;
}
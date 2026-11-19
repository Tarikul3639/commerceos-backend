import { ApiProperty } from '@nestjs/swagger';
import { PaymentResponseDto } from './payment-response.dto.js';

export class RefundResponseDto extends PaymentResponseDto {
  @ApiProperty()
  originalPaymentId!: string;
}

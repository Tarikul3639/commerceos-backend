
import { ApiProperty } from '@nestjs/swagger';
import { PaymentResponseDto } from './payment-response.dto';

export class RefundResponseDto extends PaymentResponseDto {
  @ApiProperty()
  originalPaymentId!: string;
}

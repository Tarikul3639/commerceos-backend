import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaymentStatus } from '../../../../infrastructure/database/generated/prisma/enums.js';

export const EditablePaymentStatus = [
  PaymentStatus.PAID,
  PaymentStatus.FAILED,
  PaymentStatus.CANCELLED,
] as const;

export class UpdatePaymentStatusDto {
  @ApiProperty({ enum: EditablePaymentStatus })
  @IsIn(EditablePaymentStatus)
  status!: PaymentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  transactionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

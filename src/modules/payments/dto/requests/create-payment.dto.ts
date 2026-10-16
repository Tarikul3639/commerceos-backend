import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { PaymentMethod } from '@/lib/prisma/enums';

export class CreatePaymentDto {
  @ApiProperty({ example: '2f0a2d50-ef62-4d63-b5bd-4e3c8b7a8dd0' })
  @IsUUID()
  orderId!: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiProperty({ example: '1500.00' })
  @IsNumberString()
  amount!: string;

  @ApiPropertyOptional({ example: 'checkout-2f0a2d50' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  idempotencyKey?: string;
}

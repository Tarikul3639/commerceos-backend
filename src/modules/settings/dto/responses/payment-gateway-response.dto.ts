import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PaymentGatewayMode,
  PaymentProvider,
} from '../../../../infrastructure/database/generated/prisma/enums.js';

export class PaymentGatewayResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: PaymentProvider })
  provider!: PaymentProvider;

  @ApiProperty()
  displayName!: string;

  @ApiProperty()
  isEnabled!: boolean;

  @ApiProperty({ enum: PaymentGatewayMode })
  mode!: PaymentGatewayMode;

  @ApiPropertyOptional({ nullable: true, type: Object })
  settings!: Record<string, unknown> | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

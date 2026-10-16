
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEnum,
    IsObject,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import {
    PaymentGatewayMode,
    PaymentProvider,
} from '@/lib/prisma/enums';

export class CreatePaymentGatewayConfigDto {
    @ApiProperty({ enum: PaymentProvider, example: PaymentProvider.SSL_COMMERZ })
    @IsEnum(PaymentProvider)
    provider!: PaymentProvider;

    @ApiProperty({ example: 'SSLCommerz' })
    @IsString()
    @MaxLength(100)
    displayName!: string;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    isEnabled?: boolean;

    @ApiPropertyOptional({ enum: PaymentGatewayMode, default: PaymentGatewayMode.TEST })
    @IsOptional()
    @IsEnum(PaymentGatewayMode)
    mode?: PaymentGatewayMode;

    @ApiPropertyOptional({
        example: { currency: 'BDT', transactionPrefix: 'COS' },
        type: Object,
    })
    @IsOptional()
    @IsObject()
    settings?: Record<string, unknown>;
}

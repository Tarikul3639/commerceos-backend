
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    PaymentGatewayMode,
    PaymentProvider,
} from '@/lib/prisma/enums';

export class PaymentGatewayConfigResponseDto {
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

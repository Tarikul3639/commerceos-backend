import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PaymentGatewayConfigResponseDto } from '../dto/responses/payment-gateway-config-response.dto';

@Injectable()
export class GetPaymentGatewayConfigsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(): Promise<PaymentGatewayConfigResponseDto[]> {
        const configs = await this.prisma.paymentGatewayConfig.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return configs.map((config) => ({
            id: config.id,
            provider: config.provider,
            displayName: config.displayName,
            isEnabled: config.isEnabled,
            mode: config.mode,
            settings: config.settings as Record<string, unknown> | null,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt,
        }));
    }
}

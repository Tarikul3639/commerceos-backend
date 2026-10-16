import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PaymentGatewayConfigResponseDto } from '../dto/responses/payment-gateway-config-response.dto';

@Injectable()
export class GetPaymentGatewayConfigService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(id: string): Promise<PaymentGatewayConfigResponseDto> {
        const config = await this.prisma.paymentGatewayConfig.findUnique({
            where: { id },
        });

        if (!config) {
            throw new NotFoundException(
                `Payment gateway configuration with ID ${id} not found`,
            );
        }

        return {
            id: config.id,
            provider: config.provider,
            displayName: config.displayName,
            isEnabled: config.isEnabled,
            mode: config.mode,
            settings: config.settings as Record<string, unknown> | null,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt,
        };
    }
}

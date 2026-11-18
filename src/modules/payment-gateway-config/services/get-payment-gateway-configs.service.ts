import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PaymentGatewayConfigResponseDto } from '../dto/responses/payment-gateway-config-response.dto';
import { sanitizeGatewaySettings } from '../utils/gateway-settings-safety';

@Injectable()
export class GetPaymentGatewayConfigsService {
  constructor(private readonly prisma: PrismaService) {}

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
      settings: sanitizeGatewaySettings(config.settings),
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    }));
  }
}

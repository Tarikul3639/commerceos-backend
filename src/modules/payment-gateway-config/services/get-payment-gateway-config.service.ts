import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PaymentGatewayConfigResponseDto } from '../dto/responses/payment-gateway-config-response.dto';
import { sanitizeGatewaySettings } from '../utils/gateway-settings-safety';

@Injectable()
export class GetPaymentGatewayConfigService {
  constructor(private readonly prisma: PrismaService) {}

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
      settings: sanitizeGatewaySettings(config.settings),
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }
}

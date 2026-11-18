import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Prisma } from '@/lib/prisma/client';
import { PaymentGatewayMode } from '@/lib/prisma/enums';
import { CreatePaymentGatewayConfigDto } from '../dto/requests/create-payment-gateway-config.dto';
import { PaymentGatewayConfigResponseDto } from '../dto/responses/payment-gateway-config-response.dto';
import { assertNoGatewaySecrets, sanitizeGatewaySettings } from '../utils/gateway-settings-safety';

@Injectable()
export class CreatePaymentGatewayConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    dto: CreatePaymentGatewayConfigDto,
  ): Promise<PaymentGatewayConfigResponseDto> {
    assertNoGatewaySecrets(dto.settings);

    const existing = await this.prisma.paymentGatewayConfig.findUnique({
      where: { provider: dto.provider },
    });

    if (existing) {
      throw new ConflictException(
        `Configuration for ${dto.provider} already exists`,
      );
    }

    const config = await this.prisma.paymentGatewayConfig.create({
      data: {
        provider: dto.provider,
        displayName: dto.displayName,
        isEnabled: dto.isEnabled ?? false,
        mode: dto.mode ?? PaymentGatewayMode.TEST,
        ...(dto.settings !== undefined && {
          settings: dto.settings as Prisma.InputJsonValue,
        }),
      },
    });

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

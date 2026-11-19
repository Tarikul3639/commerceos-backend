import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { Prisma } from '@/lib/prisma/client';
import { PaymentGatewayMode, PaymentProvider } from '@/lib/prisma/enums';

import { CreatePaymentGatewayDto } from '../dto/requests/create-payment-gateway.dto';
import { UpdatePaymentGatewayDto } from '../dto/requests/update-payment-gateway.dto';
import { PaymentGatewayResponseDto } from '../dto/responses/payment-gateway-response.dto';
import {
  assertNoGatewaySecrets,
  sanitizeGatewaySettings,
} from '../utils/gateway-settings-safety';

@Injectable()
export class PaymentGatewayService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a payment gateway configuration after validating provider uniqueness
   * and ensuring that secret credentials are not stored in public settings.
   */
  async create(
    createPaymentGatewayDto: CreatePaymentGatewayDto,
  ): Promise<PaymentGatewayResponseDto> {
    assertNoGatewaySecrets(createPaymentGatewayDto.settings);

    const existing = await this.prisma.paymentGateway.findUnique({
      where: { provider: createPaymentGatewayDto.provider },
    });

    if (existing) {
      throw new ConflictException(
        `Configuration for ${createPaymentGatewayDto.provider} already exists`,
      );
    }

    const paymentGateway = await this.prisma.paymentGateway.create({
      data: {
        provider: createPaymentGatewayDto.provider,
        displayName: createPaymentGatewayDto.displayName,
        isEnabled: createPaymentGatewayDto.isEnabled ?? false,
        mode: createPaymentGatewayDto.mode ?? PaymentGatewayMode.TEST,
        ...(createPaymentGatewayDto.settings !== undefined && {
          settings: createPaymentGatewayDto.settings as Prisma.InputJsonValue,
        }),
      },
    });

    return this.toResponse(paymentGateway);
  }

  /**
   * Retrieves all payment gateway configurations ordered by creation date.
   */
  async findAll(): Promise<PaymentGatewayResponseDto[]> {
    const paymentGateways = await this.prisma.paymentGateway.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return paymentGateways.map((paymentGateway) =>
      this.toResponse(paymentGateway),
    );
  }

  /**
   * Retrieves a payment gateway configuration by its ID.
   * Throws NotFoundException when the configuration does not exist.
   */
  async findOne(id: string): Promise<PaymentGatewayResponseDto> {
    const paymentGateway = await this.prisma.paymentGateway.findUnique({
      where: { id },
    });

    if (!paymentGateway) {
      throw new NotFoundException(
        `Payment gateway configuration with ID ${id} not found`,
      );
    }

    return this.toResponse(paymentGateway);
  }

  /**
   * Updates an existing payment gateway configuration while preventing
   * duplicate providers and rejecting secret credentials in public settings.
   */
  async update(
    id: string,
    updatePaymentGatewayDto: UpdatePaymentGatewayDto,
  ): Promise<PaymentGatewayResponseDto> {
    assertNoGatewaySecrets(updatePaymentGatewayDto.settings);

    const existing = await this.prisma.paymentGateway.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        `Payment gateway configuration with ID ${id} not found`,
      );
    }

    if (
      updatePaymentGatewayDto.provider !== undefined &&
      updatePaymentGatewayDto.provider !== existing.provider
    ) {
      const providerExists = await this.prisma.paymentGateway.findUnique({
        where: { provider: updatePaymentGatewayDto.provider },
      });

      if (providerExists) {
        throw new ConflictException(
          `Configuration for ${updatePaymentGatewayDto.provider} already exists`,
        );
      }
    }

    const updateData: Prisma.PaymentGatewayUpdateInput = {
      ...(updatePaymentGatewayDto.provider !== undefined && {
        provider: updatePaymentGatewayDto.provider,
      }),
      ...(updatePaymentGatewayDto.displayName !== undefined && {
        displayName: updatePaymentGatewayDto.displayName,
      }),
      ...(updatePaymentGatewayDto.isEnabled !== undefined && {
        isEnabled: updatePaymentGatewayDto.isEnabled,
      }),
      ...(updatePaymentGatewayDto.mode !== undefined && {
        mode: updatePaymentGatewayDto.mode,
      }),
      ...(updatePaymentGatewayDto.settings !== undefined && {
        settings: updatePaymentGatewayDto.settings as Prisma.InputJsonValue,
      }),
    };

    const paymentGateway = await this.prisma.paymentGateway.update({
      where: { id },
      data: updateData,
    });

    return this.toResponse(paymentGateway);
  }

  /**
   * Maps a database payment gateway record to its API response,
   * sanitizing settings before exposing them to the client.
   */
  private toResponse(paymentGateway: {
    id: string;
    provider: PaymentProvider;
    displayName: string;
    isEnabled: boolean;
    mode: PaymentGatewayMode;
    settings: Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
  }): PaymentGatewayResponseDto {
    return {
      id: paymentGateway.id,
      provider: paymentGateway.provider,
      displayName: paymentGateway.displayName,
      isEnabled: paymentGateway.isEnabled,
      mode: paymentGateway.mode,
      settings: sanitizeGatewaySettings(paymentGateway.settings),
      createdAt: paymentGateway.createdAt,
      updatedAt: paymentGateway.updatedAt,
    };
  }
}

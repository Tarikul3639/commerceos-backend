import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../infrastructure/database/generated/prisma/enums.js';
import { Prisma } from '../../../infrastructure/database/generated/prisma/client.js';
import {
  PaymentGatewayMode,
  PaymentProvider,
} from '../../../infrastructure/database/generated/prisma/enums.js';

import { CreatePaymentGatewayDto } from '../dto/requests/create-payment-gateway.dto.js';
import { UpdatePaymentGatewayDto } from '../dto/requests/update-payment-gateway.dto.js';
import { PaymentGatewayResponseDto } from '../dto/responses/payment-gateway-response.dto.js';
import {
  assertNoGatewaySecrets,
  sanitizeGatewaySettings,
} from '../utils/gateway-settings-safety.js';

@Injectable()
export class PaymentGatewayService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLog: CreateActivityLogService,
  ) {}

  /**
   * Creates a payment gateway configuration after validating provider uniqueness
   * and ensuring that secret credentials are not stored in public settings.
   */
  async create(
    createPaymentGatewayDto: CreatePaymentGatewayDto,
    userId: string,
  ): Promise<PaymentGatewayResponseDto> {
    assertNoGatewaySecrets(createPaymentGatewayDto.settings);

    const paymentGateway = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.paymentGateway.findUnique({
        where: { provider: createPaymentGatewayDto.provider },
      });

      if (existing) {
        throw new ConflictException(
          `Configuration for ${createPaymentGatewayDto.provider} already exists`,
        );
      }

      const created = await tx.paymentGateway.create({
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

      await this.activityLog.execute(
        {
          type: ActivityType.CREATE,
          module: ActivityModule.SETTINGS,
          action: 'CREATE_PAYMENT_GATEWAY',
          description: `Payment gateway ${created.provider} created`,
          entityType: 'PaymentGateway',
          entityId: created.id,
          userId,
          newValue: {
            provider: created.provider,
            displayName: created.displayName,
            isEnabled: created.isEnabled,
            mode: created.mode,
          },
        },
        tx,
      );
      return created;
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
    userId: string,
  ): Promise<PaymentGatewayResponseDto> {
    assertNoGatewaySecrets(updatePaymentGatewayDto.settings);

    const paymentGateway = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.paymentGateway.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException(
          `Payment gateway configuration with ID ${id} not found`,
        );
      }

      if (
        updatePaymentGatewayDto.provider !== undefined &&
        updatePaymentGatewayDto.provider !== existing.provider
      ) {
        const providerExists = await tx.paymentGateway.findUnique({
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

      const updated = await tx.paymentGateway.update({
        where: { id },
        data: updateData,
      });

      await this.activityLog.execute(
        {
          type: ActivityType.UPDATE,
          module: ActivityModule.SETTINGS,
          action: 'UPDATE_PAYMENT_GATEWAY',
          description: `Payment gateway ${updated.provider} updated`,
          entityType: 'PaymentGateway',
          entityId: updated.id,
          userId,
          oldValue: {
            provider: existing.provider,
            displayName: existing.displayName,
            isEnabled: existing.isEnabled,
            mode: existing.mode,
          },
          newValue: {
            provider: updated.provider,
            displayName: updated.displayName,
            isEnabled: updated.isEnabled,
            mode: updated.mode,
          },
        },
        tx,
      );
      return updated;
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

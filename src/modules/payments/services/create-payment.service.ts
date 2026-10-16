import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, PaymentStatus, PaymentType } from '@/lib/prisma/client';
import { PaymentProvider } from '@/lib/prisma/enums';
import { PrismaService } from '@/common/prisma/prisma.service';

import { CreatePaymentDto } from '../dto/requests/create-payment.dto';
import { PaymentResponseDto } from '../dto/responses/payment-response.dto';

@Injectable()
export class CreatePaymentService {
  constructor(private readonly prisma: PrismaService) { }

  async execute(
    dto: CreatePaymentDto,
    customerId: string,
  ): Promise<PaymentResponseDto> {
    const amount = new Prisma.Decimal(dto.amount);

    // Return existing payment for an idempotent request.
    if (dto.idempotencyKey) {
      const existing = await this.prisma.payment.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });

      if (existing) {
        if (existing.orderId !== dto.orderId) {
          throw new BadRequestException(
            'Idempotency key has already been used for another order',
          );
        }

        return this.toResponseDto(existing);
      }
    }

    // Map the customer's selected payment method to its provider.
    const providerByMethod: Record<string, PaymentProvider> = {
      CASH: PaymentProvider.MANUAL,
      CARD: PaymentProvider.SSL_COMMERZ,
      BKASH: PaymentProvider.BKASH,
      NAGAD: PaymentProvider.NAGAD,
      ROCKET: PaymentProvider.ROCKET,
    };

    const provider = providerByMethod[dto.method];

    if (!provider) {
      throw new BadRequestException('Unsupported payment method');
    }

    const payment = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: dto.orderId,
          customerId,
        },
        select: {
          id: true,
          total: true,
          paymentStatus: true,
          status: true,
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.paymentStatus === PaymentStatus.PAID) {
        throw new BadRequestException('Order is already paid');
      }

      if (order.status === 'CANCELLED') {
        throw new BadRequestException('Cancelled orders cannot be paid');
      }

      if (!amount.equals(order.total)) {
        throw new BadRequestException(
          'Payment amount does not match order total',
        );
      }

      // Check whether the selected payment provider is enabled.
      if (provider !== PaymentProvider.MANUAL) {
        const config = await tx.paymentGatewayConfig.findUnique({
          where: { provider },
        });

        if (!config?.isEnabled) {
          throw new BadRequestException('Payment method is not enabled');
        }
      }

      return tx.payment.create({
        data: {
          orderId: order.id,
          userId: customerId,
          amount,
          method: dto.method,
          provider,
          type: PaymentType.PAYMENT,
          status: PaymentStatus.PENDING,
          ...(dto.idempotencyKey ? { idempotencyKey: dto.idempotencyKey } : {}),
        },
      });
    });

    return this.toResponseDto(payment);
  }

  private toResponseDto(
    payment: Prisma.PaymentGetPayload<object>,
  ): PaymentResponseDto {
    return {
      id: payment.id,
      orderId: payment.orderId,
      amount: payment.amount.toString(),
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      type: payment.type,
      transactionId: payment.transactionId,
      notes: payment.notes,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}

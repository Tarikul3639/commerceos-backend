import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  PaymentStatus,
  PaymentType,
} from '../../../infrastructure/database/generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../infrastructure/database/generated/prisma/client.js';
import { CreateRefundDto } from '../dto/requests/create-refund.dto.js';

@Injectable()
export class CreateRefundService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}
  /**
   * Create a pending refund linked to a paid original payment and prevent concurrent over-refunds.
   */
  async execute(paymentId: string, dto: CreateRefundDto, userId: string) {
    const amount = new Prisma.Decimal(dto.amount);

    return this.prisma.$transaction(
      async (tx) => {
        const payment = await tx.payment.findUnique({
          where: { id: paymentId },
        });

        if (!payment) {
          throw new NotFoundException('Payment not found');
        }

        if (
          payment.type !== PaymentType.PAYMENT ||
          payment.status !== PaymentStatus.PAID
        ) {
          throw new BadRequestException(
            'Only paid payment transactions can be refunded',
          );
        }

        const refunded = await tx.payment.aggregate({
          where: {
            originalPaymentId: payment.id,
            type: PaymentType.REFUND,
            status: { in: [PaymentStatus.PENDING, PaymentStatus.PAID] },
          },
          _sum: { amount: true },
        });

        const alreadyRefunded = refunded._sum.amount ?? new Prisma.Decimal(0);

        if (
          amount.lessThanOrEqualTo(0) ||
          alreadyRefunded.plus(amount).greaterThan(payment.amount)
        ) {
          throw new BadRequestException(
            'Refund amount exceeds the refundable amount',
          );
        }

        const refund = await tx.payment.create({
          data: {
            orderId: payment.orderId,
            originalPaymentId: payment.id,
            amount,
            method: payment.method,
            status: PaymentStatus.PENDING,
            type: PaymentType.REFUND,
            ...(dto.notes ? { notes: dto.notes } : {}),
            userId,
            currency: payment.currency,
          },
        });

        await this.createActivityLogService.execute(
          {
            type: ActivityType.CREATE,
            module: ActivityModule.PAYMENT,
            action: 'CREATE_REFUND',
            description: `Refund request created for payment ${payment.id}`,
            entityType: 'Payment',
            entityId: refund.id,
            userId,
            newValue: {
              originalPaymentId: payment.id,
              amount: refund.amount.toString(),
              status: refund.status,
            },
          },
          tx,
        );

        return refund;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}

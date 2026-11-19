import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Prisma,
  PaymentStatus,
  PaymentType,
} from '../../../lib/prisma/client.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../lib/prisma/client.js';
import { PaymentMethod } from '../../../lib/prisma/enums.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';

import { UpdatePaymentStatusDto } from '../dto/requests/update-payment-status.dto.js';

@Injectable()
export class UpdatePaymentStatusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  /**
   * Apply only supported manual payment transitions using a conditional state update.
   */
  async execute(id: string, dto: UpdatePaymentStatusDto, userId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const payment = await tx.payment.findUnique({
          where: { id },
          include: {
            order: {
              select: {
                status: true,
                paymentStatus: true,
              },
            },
          },
        });

        if (!payment) {
          throw new NotFoundException('Payment not found');
        }

        if (payment.type !== PaymentType.PAYMENT) {
          throw new BadRequestException(
            'Only payment transactions can be updated',
          );
        }

        if (payment.status !== PaymentStatus.PENDING) {
          throw new BadRequestException(
            'Only pending payments can be manually updated',
          );
        }

        if (
          dto.status !== PaymentStatus.PAID &&
          dto.status !== PaymentStatus.FAILED &&
          dto.status !== PaymentStatus.CANCELLED
        ) {
          throw new BadRequestException(
            'Unsupported manual payment status transition',
          );
        }

        if (dto.status === PaymentStatus.PAID) {
          if (payment.method !== PaymentMethod.CASH) {
            throw new BadRequestException(
              'Gateway payments can only be settled by a verified provider callback',
            );
          }

          if (payment.order.status === 'CANCELLED') {
            throw new BadRequestException(
              'Cancelled orders cannot be marked as paid',
            );
          }
        }

        if (dto.status === PaymentStatus.PAID) {
          const alreadyPaid = await tx.payment.findFirst({
            where: {
              id: { not: id },
              orderId: payment.orderId,
              type: PaymentType.PAYMENT,
              status: PaymentStatus.PAID,
            },
            select: { id: true },
          });

          if (alreadyPaid) {
            throw new BadRequestException(
              'This order already has a paid payment transaction',
            );
          }
        }

        const updatedCount = await tx.payment.updateMany({
          where: {
            id,
            type: PaymentType.PAYMENT,
            status: PaymentStatus.PENDING,
          },
          data: {
            status: dto.status,
            transactionId: dto.transactionId ?? payment.transactionId,
            notes: dto.notes ?? payment.notes,
          },
        });

        if (updatedCount.count === 0) {
          throw new BadRequestException(
            'Only pending payments can be manually updated',
          );
        }

        const [paidPayment, pendingPayment] = await Promise.all([
          tx.payment.findFirst({
            where: {
              orderId: payment.orderId,
              type: PaymentType.PAYMENT,
              status: PaymentStatus.PAID,
            },
            select: { id: true },
          }),
          tx.payment.findFirst({
            where: {
              orderId: payment.orderId,
              type: PaymentType.PAYMENT,
              status: PaymentStatus.PENDING,
            },
            select: { id: true },
          }),
        ]);

        const orderPaymentStatus = paidPayment
          ? PaymentStatus.PAID
          : pendingPayment
            ? PaymentStatus.PENDING
            : dto.status;

        await tx.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: orderPaymentStatus },
        });

        const updatedPayment = await tx.payment.findUnique({
          where: { id },
        });

        if (!updatedPayment) {
          throw new NotFoundException('Payment not found');
        }

        await this.createActivityLogService.execute(
          {
            type: ActivityType.STATUS_CHANGE,
            module: ActivityModule.PAYMENT,
            action: 'UPDATE_PAYMENT_STATUS',
            description: `Payment ${id} status changed from ${payment.status} to ${updatedPayment.status}`,
            entityType: 'Payment',
            entityId: id,
            userId,
            oldValue: {
              status: payment.status,
              orderPaymentStatus: payment.order.paymentStatus,
            },
            newValue: {
              status: updatedPayment.status,
              orderPaymentStatus,
              transactionId: updatedPayment.transactionId,
              notes: updatedPayment.notes,
            },
          },
          tx,
        );

        return {
          ...updatedPayment,
          amount: updatedPayment.amount.toString(),
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}

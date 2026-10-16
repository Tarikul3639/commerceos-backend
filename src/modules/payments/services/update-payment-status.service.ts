import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus, PaymentType } from '@/lib/prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UpdatePaymentStatusDto } from '../dto/requests/update-payment-status.dto';

@Injectable()
export class UpdatePaymentStatusService {
  constructor(private readonly prisma: PrismaService) {}
  async execute(id: string, dto: UpdatePaymentStatusDto) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id },
        include: { order: { select: { total: true } } },
      });
      if (!payment) throw new NotFoundException('Payment not found');
      if (payment.type !== PaymentType.PAYMENT)
        throw new BadRequestException(
          'Only payment transactions can be updated',
        );
      if (
        payment.status === PaymentStatus.PAID &&
        dto.status !== PaymentStatus.REFUNDED
      ) {
        throw new BadRequestException('Paid payments cannot be changed');
      }
      if (
        dto.status === PaymentStatus.PAID &&
        !dto.transactionId &&
        payment.method !== 'CASH'
      ) {
        throw new BadRequestException('A verified transaction ID is required');
      }
      const updated = await tx.payment.update({
        where: { id },
        data: {
          status: dto.status,
          transactionId: dto.transactionId ?? payment.transactionId,
          notes: dto.notes ?? payment.notes,
        },
      });
      const paid = dto.status === PaymentStatus.PAID;
      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: paid
            ? PaymentStatus.PAID
            : dto.status === PaymentStatus.REFUNDED
              ? PaymentStatus.REFUNDED
              : PaymentStatus.PENDING,
        },
      });
      return { ...updated, amount: updated.amount.toString() };
    });
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PaymentStatus, PaymentType } from '@/lib/prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateRefundDto } from '../dto/requests/create-refund.dto';

@Injectable()
export class CreateRefundService {
  constructor(private readonly prisma: PrismaService) {}
  async execute(paymentId: string, dto: CreateRefundDto, userId: string) {
    const amount = new Prisma.Decimal(dto.amount);
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id: paymentId } });
      if (!payment) throw new NotFoundException('Payment not found');
      if (payment.status !== PaymentStatus.PAID)
        throw new BadRequestException('Only paid payments can be refunded');
      const refunded = await tx.payment.aggregate({
        where: {
          orderId: payment.orderId,
          type: PaymentType.REFUND,
          status: { in: [PaymentStatus.PENDING, PaymentStatus.PAID] },
        },
        _sum: { amount: true },
      });
      const alreadyRefunded = refunded._sum.amount ?? new Prisma.Decimal(0);
      if (
        amount.lessThanOrEqualTo(0) ||
        alreadyRefunded.plus(amount).greaterThan(payment.amount)
      )
        throw new BadRequestException(
          'Refund amount exceeds the refundable amount',
        );
      return tx.payment.create({
        data: {
          orderId: payment.orderId,
          amount,
          method: payment.method,
          status: PaymentStatus.PENDING,
          type: PaymentType.REFUND,
          ...(dto.notes ? { notes: dto.notes } : {}),
          userId,
          currency: 'BDT',
        },
      });
    });
  }
}

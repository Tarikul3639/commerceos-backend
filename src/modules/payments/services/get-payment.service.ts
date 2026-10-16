import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class GetPaymentService {
  constructor(private readonly prisma: PrismaService) {}
  async execute(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            id: true,
            invoiceNo: true,
            total: true,
            paymentStatus: true,
          },
        },
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return {
      ...payment,
      amount: payment.amount.toString(),
      order: { ...payment.order, total: payment.order.total.toString() },
    };
  }
}

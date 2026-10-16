import { Injectable } from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PaymentQueryDto } from '../dto/requests/payment-query.dto';

@Injectable()
export class GetPaymentsService {
  constructor(private readonly prisma: PrismaService) {}
  async execute(query: PaymentQueryDto) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 100);
    const search = query.search?.trim();
    const where: Prisma.PaymentWhereInput = {
      ...(query.method && { method: query.method }),
      ...(query.status && { status: query.status }),
      ...(search && {
        OR: [
          { transactionId: { contains: search, mode: 'insensitive' } },
          { order: { invoiceNo: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };
    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      this.prisma.payment.count({ where }),
    ]);
    return {
      data: payments.map((payment) => ({
        ...payment,
        amount: payment.amount.toString(),
        order: { ...payment.order, total: payment.order.total.toString() },
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }
}

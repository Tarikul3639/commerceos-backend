import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { Prisma } from '../../../lib/prisma/client.js';
import { OrderReturnResponseDto } from '../dto/responses/order-return-response.dto.js';

const orderReturnInclude = {
  order: {
    select: {
      id: true,
      invoiceNo: true,
      customer: { select: { id: true, name: true } },
    },
  },
  items: {
    include: {
      orderItem: {
        select: {
          id: true,
          quantity: true,
          variantId: true,
          product: { select: { id: true, name: true } },
        },
      },
    },
  },
  createdBy: { select: { id: true, name: true, email: true } },
  approvedBy: { select: { id: true, name: true, email: true } },
  rejectedBy: { select: { id: true, name: true, email: true } },
  completedBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.OrderReturnInclude;

@Injectable()
export class GetOrderReturnService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(returnId: string): Promise<OrderReturnResponseDto> {
    const orderReturn = await this.prisma.orderReturn.findUnique({
      where: { id: returnId },
      include: orderReturnInclude,
    });

    if (!orderReturn) {
      throw new NotFoundException('Order return not found');
    }

    return {
      id: orderReturn.id,
      returnNo: orderReturn.returnNo,
      status: orderReturn.status,
      reason: orderReturn.reason,
      rejectionReason: orderReturn.rejectionReason,
      order: orderReturn.order,
      items: orderReturn.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        reason: item.reason,
        orderItemId: item.orderItemId,
        orderItem: item.orderItem,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      createdBy: orderReturn.createdBy,
      approvedBy: orderReturn.approvedBy,
      approvedAt: orderReturn.approvedAt,
      rejectedBy: orderReturn.rejectedBy,
      rejectedAt: orderReturn.rejectedAt,
      completedBy: orderReturn.completedBy,
      completedAt: orderReturn.completedAt,
      createdAt: orderReturn.createdAt,
      updatedAt: orderReturn.updatedAt,
    };
  }
}

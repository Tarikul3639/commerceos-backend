import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { OrderStatus } from '@/lib/prisma/client';

import { PrismaService } from '@/common/prisma/prisma.service';
import { UpdateOrderStatusDto } from '../dto/requests/update-order-status.dto';

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

@Injectable()
export class UpdateOrderStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    orderId: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!allowedTransitions[order.status].includes(updateOrderStatusDto.status)) {
      throw new BadRequestException(
        `Order cannot transition from ${order.status} to ${updateOrderStatusDto.status}`,
      );
    }

    return this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: updateOrderStatusDto.status,
      },
    });
  }
}

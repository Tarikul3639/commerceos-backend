import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { OrderStatus } from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { CancelOrderDto } from '../dto/requests/cancel-order.dto';

@Injectable()
export class CancelOrderService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(orderId: string, cancelOrderDto: CancelOrderDto) {
        const order = await this.prisma.order.findUnique({
            where: {
                id: orderId,
            },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.status === OrderStatus.CANCELLED) {
            throw new BadRequestException('Order is already cancelled');
        }

        return this.prisma.order.update({
            where: {
                id: orderId,
            },

            data: {
                status: OrderStatus.CANCELLED,
                ...(cancelOrderDto.reason !== undefined && {
                    cancellationReason: cancelOrderDto.reason,
                }),
            },
        });
    }
}

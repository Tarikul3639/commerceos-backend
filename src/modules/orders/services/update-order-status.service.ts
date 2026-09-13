import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { OrderStatus } from '../../../lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { UpdateOrderStatusDto } from '../dto/requests/update-order-status.dto';

@Injectable()
export class UpdateOrderStatusService {
    constructor(private readonly prisma: PrismaService) { }

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

        if (order.status === OrderStatus.CANCELLED) {
            throw new BadRequestException('Cancelled order status cannot be changed');
        }

        if (updateOrderStatusDto.status === OrderStatus.CANCELLED) {
            throw new BadRequestException(
                'Use cancel order endpoint to cancel an order',
            );
        }

        if (order.status === updateOrderStatusDto.status) {
            throw new BadRequestException('Order already has this status');
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

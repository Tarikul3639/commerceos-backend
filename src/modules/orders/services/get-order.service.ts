import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { OrderResponseDto } from '../dto/responses/order-response.dto';

/*
 * SERVICE: GetOrderService
 */

@Injectable()
export class GetOrderService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(orderId: string): Promise<OrderResponseDto> {
        /*
         * Fetch order details with associated relations
         */
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                customer: {
                    select: { id: true, name: true },
                },
                user: {
                    select: { id: true, name: true, email: true },
                },
                orderItems: {
                    include: {
                        product: {
                            select: { id: true, name: true, sku: true },
                        },
                    },
                },
            },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        /*
         * Format price fields and return order response payload
         */
        return {
            id: order.id,
            invoiceNo: order.invoiceNo,
            subtotal: order.subtotal.toString(),
            discount: order.discount.toString(),
            tax: order.tax.toString(),
            total: order.total.toString(),
            paymentStatus: order.paymentStatus,
            status: order.status,
            customer: order.customer,
            user: order.user,
            items: order.orderItems.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                unitPrice: item.unitPrice.toString(),
                subtotal: item.subtotal.toString(),
                productId: item.productId,
                product: item.product,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            })),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        };
    }
}

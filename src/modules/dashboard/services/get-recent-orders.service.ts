import { Injectable } from "@nestjs/common"

import { PrismaService } from "../../../common/prisma/prisma.service"
import { RecentOrderItemDto } from "../dto/responses/recent-orders-response.dto"

@Injectable()
export class GetRecentOrdersService {
    constructor(private readonly prisma: PrismaService) {}

    async execute(limit = 10): Promise<RecentOrderItemDto[]> {
        // Clamp here as well as validating the HTTP query so internal callers
        // cannot accidentally request an unbounded dashboard query.
        const take = Math.min(Math.max(Number(limit) || 10, 1), 20)

        const orders = await this.prisma.order.findMany({
            take,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                invoiceNo: true,
                total: true,
                status: true,
                paymentStatus: true,
                createdAt: true,
                customer: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        return orders.map((order) => ({
            id: order.id,
            orderNumber: order.invoiceNo,
            customer: order.customer,
            total: order.total.toString(),
            status: order.status,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
        }))
    }
}

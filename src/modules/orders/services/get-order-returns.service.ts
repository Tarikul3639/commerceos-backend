import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../infrastructure/database/generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface.js';
import { OrderReturnQueryDto } from '../dto/requests/order-return-query.dto.js';
import { OrderReturnResponseDto } from '../dto/responses/order-return-response.dto.js';

@Injectable()
export class GetOrderReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: OrderReturnQueryDto,
  ): Promise<PaginatedResponse<OrderReturnResponseDto>> {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);
    const search = query.search?.trim();

    const where: Prisma.OrderReturnWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.orderId && { orderId: query.orderId }),
      ...(query.createdById && { createdById: query.createdById }),
      ...(query.approvedById && { approvedById: query.approvedById }),
      ...(search && {
        OR: [
          { returnNo: { contains: search, mode: 'insensitive' } },
          { order: { invoiceNo: { contains: search, mode: 'insensitive' } } },
          {
            order: {
              customer: { name: { contains: search, mode: 'insensitive' } },
            },
          },
        ],
      }),
    };

    const include = {
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

    const [orderReturns, total] = await Promise.all([
      this.prisma.orderReturn.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include,
      }),
      this.prisma.orderReturn.count({ where }),
    ]);

    return {
      data: orderReturns.map((orderReturn) => ({
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

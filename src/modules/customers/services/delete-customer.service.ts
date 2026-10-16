import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';

@Injectable()
export class DeleteCustomerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,

    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(customerId: string): Promise<void> {
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },

      select: {
        publicId: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Customer has orders → Soft delete
    if (customer._count.orders > 0) {
      await this.prisma.customer.update({
        where: {
          id: customerId,
        },

        data: {
          status: 'DELETED',
          deletedAt: new Date(),
        },
      });

      return;
    }

    // No orders → Hard delete
    // Delete avatar from Cloudinary before deleting the customer.
    if (customer.publicId) {
      await this.cloudinaryService.delete(customer.publicId, 'image');
    }

    // Cart will be deleted automatically because of onDelete: Cascade
    await this.prisma.customer.delete({
      where: {
        id: customerId,
      },
    });
    await this.createActivityLogService.execute({
      type: ActivityType.DELETE,
      module: ActivityModule.CUSTOMER,
      action: 'DELETE_CUSTOMER',
      entityType: 'Customer',
      entityId: customerId,
      oldValue: {
        publicId: customer.publicId,
        orderCount: customer._count.orders,
      },
    });
  }
}

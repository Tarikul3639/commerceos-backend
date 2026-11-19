import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../lib/prisma/client.js';
import { CloudinaryService } from '../../../common/cloudinary/cloudinary.service.js';

@Injectable()
export class DeleteCustomerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  /**
   * Delete a customer, revoke active sessions for soft-deleted accounts and attribute the action.
   */
  async execute(customerId: string, userId: string): Promise<void> {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        publicId: true,
        status: true,
        deletedAt: true,
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

    if (customer._count.orders > 0) {
      const deletedCustomer = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.customer.update({
          where: { id: customerId },
          data: {
            status: 'DELETED',
            deletedAt: new Date(),
          },
        });

        await tx.customerRefreshToken.updateMany({
          where: {
            customerId,
            revokedAt: null,
          },
          data: { revokedAt: new Date() },
        });

        await tx.customerPasswordResetToken.deleteMany({
          where: { customerId },
        });

        await tx.customerEmailVerificationToken.deleteMany({
          where: { customerId },
        });

        return updated;
      });

      await this.createActivityLogService.execute({
        type: ActivityType.DELETE,
        module: ActivityModule.CUSTOMER,
        action: 'SOFT_DELETE_CUSTOMER',
        entityType: 'Customer',
        entityId: customerId,
        userId,
        oldValue: {
          status: customer.status,
          deletedAt: customer.deletedAt,
          orderCount: customer._count.orders,
        },
        newValue: {
          status: deletedCustomer.status,
          deletedAt: deletedCustomer.deletedAt,
          activeSessionsRevoked: true,
        },
      });

      return;
    }

    if (customer.publicId) {
      await this.cloudinaryService.delete(customer.publicId, 'image');
    }

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
      userId,
      oldValue: {
        name: customer.name,
        email: customer.email,
        publicId: customer.publicId,
        orderCount: customer._count.orders,
      },
      newValue: 'Customer permanently deleted',
    });
  }
}

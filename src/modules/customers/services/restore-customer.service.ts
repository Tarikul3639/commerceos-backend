import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../infrastructure/database/generated/prisma/client.js';

@Injectable()
export class RestoreCustomerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(customerId: string, userId: string): Promise<void> {
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },

      select: {
        status: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (customer.status !== 'DELETED') {
      throw new BadRequestException('Customer is not deleted');
    }

    await this.prisma.$transaction(async (tx) => {
      const restoredCustomer = await tx.customer.update({
        where: { id: customerId },
        data: { status: 'ACTIVE', deletedAt: null },
      });

      await this.createActivityLogService.execute(
        {
          type: ActivityType.UPDATE,
          module: ActivityModule.CUSTOMER,
          action: 'RESTORE_CUSTOMER',
          entityType: 'Customer',
          entityId: restoredCustomer.id,
          userId,
          oldValue: { status: customer.status },
          newValue: {
            status: restoredCustomer.status,
            deletedAt: restoredCustomer.deletedAt,
          },
        },
        tx,
      );
    });
  }
}

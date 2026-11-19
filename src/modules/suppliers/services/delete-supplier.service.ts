import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../infrastructure/database/generated/prisma/client.js';

@Injectable()
export class DeleteSupplierService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(supplierId: string, userId: string): Promise<void> {
    const supplier = await this.prisma.supplier.findFirst({
      where: {
        id: supplierId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            purchases: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const hasPurchaseHistory = supplier._count.purchases > 0;
    await this.prisma.$transaction(async (tx) => {
      if (hasPurchaseHistory) {
        const deletedSupplier = await tx.supplier.update({
          where: { id: supplierId },
          data: { deletedAt: new Date(), isActive: false },
        });

        await this.createActivityLogService.execute(
          {
            type: ActivityType.DELETE,
            module: ActivityModule.SUPPLIER,
            action: 'SOFT_DELETE_SUPPLIER',
            description: 'Supplier soft deleted',
            entityType: 'Supplier',
            entityId: supplier.id,
            userId,
            oldValue: {
              name: supplier.name,
              email: supplier.email,
              phone: supplier.phone,
              isActive: supplier.isActive,
              deletedAt: supplier.deletedAt,
            },
            newValue: {
              name: deletedSupplier.name,
              email: deletedSupplier.email,
              phone: deletedSupplier.phone,
              isActive: deletedSupplier.isActive,
              deletedAt: deletedSupplier.deletedAt,
            },
          },
          tx,
        );
        return;
      }

      await tx.supplier.delete({ where: { id: supplierId } });
      await this.createActivityLogService.execute(
        {
          type: ActivityType.DELETE,
          module: ActivityModule.SUPPLIER,
          action: 'DELETE_SUPPLIER',
          description: 'Supplier permanently deleted',
          entityType: 'Supplier',
          entityId: supplier.id,
          userId,
          oldValue: {
            name: supplier.name,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address,
            contactPerson: supplier.contactPerson,
            isActive: supplier.isActive,
            deletedAt: supplier.deletedAt,
          },
          newValue: '',
        },
        tx,
      );
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';

@Injectable()
export class DeleteSupplierService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) { }

  async execute(supplierId: string): Promise<void> {
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

    // Soft delete when the supplier has purchase history
    if (supplier._count.purchases > 0) {
      const deletedSupplier = await this.prisma.supplier.update({
        where: {
          id: supplierId,
        },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });

      await this.createActivityLogService.execute({
        type: ActivityType.DELETE,
        module: ActivityModule.SUPPLIER,
        action: 'SOFT_DELETE_SUPPLIER',
        description: `Supplier "${supplier.name}" was soft deleted`,
        entityType: 'Supplier',
        entityId: supplier.id,
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
      });

      return;
    }

    // Hard delete when the supplier has no purchase history
    await this.prisma.supplier.delete({
      where: {
        id: supplierId,
      },
    });

    // Activity Log Creation
    await this.createActivityLogService.execute({
      type: ActivityType.DELETE,
      module: ActivityModule.SUPPLIER,
      action: 'DELETE_SUPPLIER',
      description: `Supplier "${supplier.name}" was permanently deleted`,
      entityType: 'Supplier',
      entityId: supplier.id,
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
    });
  }
}
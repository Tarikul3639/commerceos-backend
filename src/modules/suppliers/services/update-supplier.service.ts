import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../lib/prisma/client.js';

import { UpdateSupplierDto } from '../dto/requests/update-supplier.dto.js';
import { SupplierResponseDto } from '../dto/responses/supplier-response.dto.js';

@Injectable()
export class UpdateSupplierService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(
    supplierId: string,

    updateSupplierDto: UpdateSupplierDto,
    userId: string,
  ): Promise<SupplierResponseDto> {
    const supplier = await this.prisma.supplier.findFirst({
      where: {
        id: supplierId,

        deletedAt: null,
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const { name, email, phone, address, contactPerson, isActive } =
      updateSupplierDto;

    if (email !== undefined && email !== supplier.email) {
      const existingSupplier = await this.prisma.supplier.findUnique({
        where: {
          email,
        },
      });

      if (existingSupplier && existingSupplier.id !== supplierId) {
        throw new ConflictException('Supplier with this email already exists');
      }
    }

    if (phone !== undefined && phone !== supplier.phone) {
      const existingSupplier = await this.prisma.supplier.findUnique({
        where: {
          phone,
        },
      });

      if (existingSupplier && existingSupplier.id !== supplierId) {
        throw new ConflictException('Supplier with this phone already exists');
      }
    }

    const updatedSupplier = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.supplier.update({
        where: { id: supplierId },
        data: {
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email }),
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
          ...(contactPerson !== undefined && { contactPerson }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      await this.createActivityLogService.execute(
        {
          type: ActivityType.UPDATE,
          module: ActivityModule.SUPPLIER,
          action: 'UPDATE_SUPPLIER',
          description: 'Supplier updated',
          entityType: 'Supplier',
          entityId: updated.id,
          userId,
          oldValue: {
            name: supplier.name,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address,
            contactPerson: supplier.contactPerson,
            isActive: supplier.isActive,
          },
          newValue: {
            name: updated.name,
            email: updated.email,
            phone: updated.phone,
            address: updated.address,
            contactPerson: updated.contactPerson,
            isActive: updated.isActive,
          },
        },
        tx,
      );
      return updated;
    });

    return {
      id: updatedSupplier.id,
      name: updatedSupplier.name,
      email: updatedSupplier.email,
      phone: updatedSupplier.phone,
      address: updatedSupplier.address,
      contactPerson: updatedSupplier.contactPerson,
      isActive: updatedSupplier.isActive,
      createdAt: updatedSupplier.createdAt,
      updatedAt: updatedSupplier.updatedAt,
    };
  }
}

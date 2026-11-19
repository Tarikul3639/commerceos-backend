import { ConflictException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../lib/prisma/client.js';

import { CreateSupplierDto } from '../dto/requests/create-supplier.dto.js';
import { SupplierResponseDto } from '../dto/responses/supplier-response.dto.js';

@Injectable()
export class CreateSupplierService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(
    createSupplierDto: CreateSupplierDto,
    userId: string,
  ): Promise<SupplierResponseDto> {
    const { name, email, phone, address, contactPerson } = createSupplierDto;

    /**
     * Check if a supplier with the same email already exists
     * If it does, throw a ConflictException
     */
    if (email) {
      const existingSupplier = await this.prisma.supplier.findUnique({
        where: {
          email,
        },
      });

      if (existingSupplier) {
        throw new ConflictException('Supplier with this email already exists');
      }
    }

    /**
     * Check if a supplier with the same phone number already exists
     * If it does, throw a ConflictException
     */
    if (phone) {
      const existingSupplier = await this.prisma.supplier.findUnique({
        where: {
          phone,
        },
      });

      if (existingSupplier) {
        throw new ConflictException('Supplier with this phone already exists');
      }
    }

    /**
     * Create a new supplier in the database
     */
    const supplier = await this.prisma.$transaction(async (tx) => {
      const created = await tx.supplier.create({
        data: {
          name,
          ...(email !== undefined && { email }),
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
          ...(contactPerson !== undefined && { contactPerson }),
        },
      });

      await this.createActivityLogService.execute(
        {
          type: ActivityType.CREATE,
          module: ActivityModule.SUPPLIER,
          action: 'CREATE_SUPPLIER',
          description: 'Supplier created',
          entityType: 'Supplier',
          entityId: created.id,
          userId,
          newValue: {
            name: created.name,
            email: created.email,
            phone: created.phone,
            address: created.address,
            contactPerson: created.contactPerson,
            isActive: created.isActive,
          },
        },
        tx,
      );
      return created;
    });

    return {
      id: supplier.id,

      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,

      address: supplier.address,
      contactPerson: supplier.contactPerson,

      isActive: supplier.isActive,

      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
    };
  }
}

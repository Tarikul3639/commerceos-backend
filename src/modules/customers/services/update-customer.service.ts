import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CloudinaryService } from '../../../common/cloudinary/cloudinary.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../lib/prisma/client.js';

import { UpdateCustomerDto } from '../dto/requests/update-customer.dto.js';
import { CustomerResponseDto } from '../dto/responses/customer-response.dto.js';

@Injectable()
export class UpdateCustomerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(
    customerId: string,
    updateCustomerDto: UpdateCustomerDto,
    userId: string,
  ): Promise<CustomerResponseDto> {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        deletedAt: null,
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        publicId: true,
        address: true,
        status: true,
        isVerified: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const { name, email, phone, avatarUrl, publicId, address } =
      updateCustomerDto;

    if ((avatarUrl !== undefined) !== (publicId !== undefined)) {
      throw new BadRequestException(
        'Avatar URL and Cloudinary public ID must be updated together',
      );
    }

    if ((avatarUrl === null) !== (publicId === null)) {
      throw new BadRequestException(
        'Avatar URL and Cloudinary public ID must both be removed together',
      );
    }

    // Verified customer email cannot be changed.
    if (
      email !== undefined &&
      email !== customer.email &&
      customer.isVerified
    ) {
      throw new ConflictException('Cannot update email for verified customers');
    }

    // Check email uniqueness.
    if (email !== undefined && email !== customer.email) {
      const existingCustomer = await this.prisma.customer.findUnique({
        where: {
          email,
        },

        select: {
          id: true,
        },
      });

      if (existingCustomer && existingCustomer.id !== customerId) {
        throw new ConflictException('Email already exists');
      }
    }

    // Check phone uniqueness.
    if (phone !== undefined && phone !== customer.phone) {
      const existingCustomer = await this.prisma.customer.findUnique({
        where: {
          phone,
        },

        select: {
          id: true,
        },
      });

      if (existingCustomer && existingCustomer.id !== customerId) {
        throw new ConflictException('Phone number already exists');
      }
    }

    const updatedCustomer = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.customer.update({
        where: { id: customerId },
        data: {
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email }),
          ...(phone !== undefined && { phone }),
          ...(avatarUrl !== undefined && { avatarUrl }),
          ...(publicId !== undefined && { publicId }),
          ...(address !== undefined && { address }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          publicId: true,
          address: true,
          status: true,
          isVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (email !== undefined && email !== customer.email) {
        await tx.customerEmailVerificationToken.deleteMany({
          where: { customerId },
        });

        await tx.customerPasswordResetToken.deleteMany({
          where: { customerId },
        });
      }

      return updated;
    });

    await this.createActivityLogService.execute({
      type: ActivityType.UPDATE,
      module: ActivityModule.CUSTOMER,
      action: 'UPDATE_CUSTOMER',
      entityType: 'Customer',
      entityId: updatedCustomer.id,
      userId,
      oldValue: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        avatarUrl: customer.avatarUrl,
        publicId: customer.publicId,
        address: customer.address,
        status: customer.status,
      },
      newValue: {
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        avatarUrl: updatedCustomer.avatarUrl,
        publicId: updatedCustomer.publicId,
        address: updatedCustomer.address,
        status: updatedCustomer.status,
      },
    });

    if (
      publicId !== undefined &&
      publicId !== customer.publicId &&
      customer.publicId
    ) {
      await this.cloudinaryService.delete(customer.publicId, 'image');
    }

    return updatedCustomer;
  }
}

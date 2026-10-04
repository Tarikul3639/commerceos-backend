import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { UpdateCustomerDto } from '../dto/requests/update-customer.dto';
import { CustomerResponseDto } from '../dto/responses/customer-response.dto';

@Injectable()
export class UpdateCustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    customerId: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        deletedAt: null,
      },

      select: {
        id: true,
        email: true,
        phone: true,
        isVerified: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const { name, email, phone, avatarUrl, publicId, address } =
      updateCustomerDto;

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

    return this.prisma.customer.update({
      where: {
        id: customerId,
      },

      data: {
        ...(name !== undefined && {
          name,
        }),

        ...(email !== undefined && {
          email,
        }),

        ...(phone !== undefined && {
          phone,
        }),

        ...(avatarUrl !== undefined && {
          avatarUrl,
        }),

        ...(publicId !== undefined && {
          publicId,
        }),

        ...(address !== undefined && {
          address,
        }),
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
  }
}

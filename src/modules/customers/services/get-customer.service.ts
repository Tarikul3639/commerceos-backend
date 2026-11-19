import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';

import { CustomerResponseDto } from '../dto/responses/customer-response.dto.js';
@Injectable()
export class GetCustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(customerId: string): Promise<CustomerResponseDto> {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
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

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }
}

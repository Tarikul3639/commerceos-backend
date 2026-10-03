import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class RestoreCustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(customerId: string): Promise<void> {
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

    await this.prisma.customer.update({
      where: {
        id: customerId,
      },

      data: {
        status: 'ACTIVE',
        deletedAt: null,
      },
    });
  }
}

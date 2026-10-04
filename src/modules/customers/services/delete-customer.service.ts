import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';

@Injectable()
export class DeleteCustomerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(customerId: string): Promise<void> {
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },

      select: {
        publicId: true,
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

    // Customer has orders → Soft delete
    if (customer._count.orders > 0) {
      await this.prisma.customer.update({
        where: {
          id: customerId,
        },

        data: {
          status: 'DELETED',
          deletedAt: new Date(),
        },
      });

      return;
    }

    // No orders → Hard delete
    // Delete avatar from Cloudinary before deleting the customer.
    if (customer.publicId) {
      await this.cloudinaryService.delete(customer.publicId, 'image');
    }

    // Cart will be deleted automatically because of onDelete: Cascade
    await this.prisma.customer.delete({
      where: {
        id: customerId,
      },
    });
  }
}

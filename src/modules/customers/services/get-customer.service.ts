import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

import { CustomerResponseDto } from '../dto/responses/customer-response.dto';

@Injectable()
export class GetCustomerService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(customerId: string): Promise<CustomerResponseDto> {
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

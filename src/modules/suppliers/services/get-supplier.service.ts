import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { SupplierResponseDto } from '../dto/responses/supplier-response.dto';

@Injectable()
export class GetSupplierService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async execute(
        supplierId: string,
    ): Promise<SupplierResponseDto> {

        const supplier =
            await this.prisma.supplier.findFirst({
                where: {
                    id: supplierId,
                    deletedAt: null,
                },
            });

        if (!supplier) {
            throw new NotFoundException(
                'Supplier not found',
            );
        }

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
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class DeleteSupplierService {
    constructor(private readonly prisma: PrismaService) { }

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

        if (supplier._count.purchases > 0) {
            await this.prisma.supplier.update({
                where: {
                    id: supplierId,
                },

                data: {
                    deletedAt: new Date(),
                    isActive: false,
                },
            });

            return;
        }

        await this.prisma.supplier.delete({
            where: {
                id: supplierId,
            },
        });
    }
}

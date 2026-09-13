import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { WarehouseResponseDto } from '../dto/responses/warehouse-response.dto';

@Injectable()
export class GetWarehouseService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async execute(
        warehouseId: string,
    ): Promise<WarehouseResponseDto> {
        const warehouse = await this.prisma.warehouse.findFirst({
            where: {
                id: warehouseId,
                deletedAt: null,
            },

            select: {
                id: true,
                name: true,
                address: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!warehouse) {
            throw new NotFoundException('Warehouse not found');
        }

        return warehouse;
    }
}
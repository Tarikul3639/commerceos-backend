import {
    ConflictException,
    Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { CreateWarehouseDto } from '../dto/requests/create-warehouse.dto';
import { WarehouseResponseDto } from '../dto/responses/warehouse-response.dto';

@Injectable()
export class CreateWarehouseService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async execute(
        createWarehouseDto: CreateWarehouseDto,
    ): Promise<WarehouseResponseDto> {
        const { name, address, isActive } = createWarehouseDto;

        const existingWarehouse =
            await this.prisma.warehouse.findUnique({
                where: {
                    name,
                },

                select: {
                    id: true,
                },
            });

        if (existingWarehouse) {
            throw new ConflictException(
                'Warehouse with this name already exists',
            );
        }

        const warehouse = await this.prisma.warehouse.create({
            data: {
                name: name.trim(),

                ...(address !== undefined && {
                    address: address.trim(),
                }),

                ...(isActive !== undefined && {
                    isActive,
                }),
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

        return warehouse;
    }
}
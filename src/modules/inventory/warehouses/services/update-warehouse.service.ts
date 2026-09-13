import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { UpdateWarehouseDto } from '../dto/requests/update-warehouse.dto';
import { WarehouseResponseDto } from '../dto/responses/warehouse-response.dto';

@Injectable()
export class UpdateWarehouseService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        warehouseId: string,
        updateWarehouseDto: UpdateWarehouseDto,
    ): Promise<WarehouseResponseDto> {
        const warehouse = await this.prisma.warehouse.findFirst({
            where: {
                id: warehouseId,
                deletedAt: null,
            },

            select: {
                id: true,
                name: true,
            },
        });

        if (!warehouse) {
            throw new NotFoundException('Warehouse not found');
        }

        /**
         * Check name uniqueness if name is being updated.
         */
        if (updateWarehouseDto.name !== undefined) {
            const normalizedName = updateWarehouseDto.name.trim();

            const existingWarehouse = await this.prisma.warehouse.findFirst({
                where: {
                    name: normalizedName,

                    id: {
                        not: warehouseId,
                    },
                },

                select: {
                    id: true,
                },
            });

            if (existingWarehouse) {
                throw new ConflictException('Warehouse with this name already exists');
            }
        }

        const updatedWarehouse = await this.prisma.warehouse.update({
            where: {
                id: warehouseId,
            },

            data: {
                ...(updateWarehouseDto.name !== undefined && {
                    name: updateWarehouseDto.name.trim(),
                }),

                ...(updateWarehouseDto.address !== undefined && {
                    address:
                        updateWarehouseDto.address === null
                            ? null
                            : updateWarehouseDto.address.trim(),
                }),

                ...(updateWarehouseDto.isActive !== undefined && {
                    isActive: updateWarehouseDto.isActive,
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

        return updatedWarehouse;
    }
}

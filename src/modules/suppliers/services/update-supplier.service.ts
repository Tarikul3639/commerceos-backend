import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { UpdateSupplierDto } from '../dto/requests/update-supplier.dto';
import { SupplierResponseDto } from '../dto/responses/supplier-response.dto';

@Injectable()
export class UpdateSupplierService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        supplierId: string,

        updateSupplierDto: UpdateSupplierDto,
    ): Promise<SupplierResponseDto> {
        const supplier = await this.prisma.supplier.findFirst({
            where: {
                id: supplierId,

                deletedAt: null,
            },
        });

        if (!supplier) {
            throw new NotFoundException('Supplier not found');
        }

        const { name, email, phone, address, contactPerson, isActive } =
            updateSupplierDto;

        if (email !== undefined && email !== supplier.email) {
            const existingSupplier = await this.prisma.supplier.findUnique({
                where: {
                    email,
                },
            });

            if (existingSupplier && existingSupplier.id !== supplierId) {
                throw new ConflictException('Supplier with this email already exists');
            }
        }

        if (phone !== undefined && phone !== supplier.phone) {
            const existingSupplier = await this.prisma.supplier.findUnique({
                where: {
                    phone,
                },
            });

            if (existingSupplier && existingSupplier.id !== supplierId) {
                throw new ConflictException('Supplier with this phone already exists');
            }
        }

        const updatedSupplier = await this.prisma.supplier.update({
            where: {
                id: supplierId,
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

                ...(address !== undefined && {
                    address,
                }),

                ...(contactPerson !== undefined && {
                    contactPerson,
                }),

                ...(isActive !== undefined && {
                    isActive,
                }),
            },
        });

        return {
            id: updatedSupplier.id,
            name: updatedSupplier.name,
            email: updatedSupplier.email,
            phone: updatedSupplier.phone,
            address: updatedSupplier.address,
            contactPerson: updatedSupplier.contactPerson,
            isActive: updatedSupplier.isActive,
            createdAt: updatedSupplier.createdAt,
            updatedAt: updatedSupplier.updatedAt,
        };
    }
}

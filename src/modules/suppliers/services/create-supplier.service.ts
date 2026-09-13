import { ConflictException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { CreateSupplierDto } from '../dto/requests/create-supplier.dto';
import { SupplierResponseDto } from '../dto/responses/supplier-response.dto';

@Injectable()
export class CreateSupplierService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        createSupplierDto: CreateSupplierDto,
    ): Promise<SupplierResponseDto> {
        const { name, email, phone, address, contactPerson } = createSupplierDto;

        /**
         * Check if a supplier with the same email already exists
         * If it does, throw a ConflictException
         */
        if (email) {
            const existingSupplier = await this.prisma.supplier.findUnique({
                where: {
                    email,
                },
            });

            if (existingSupplier) {
                throw new ConflictException('Supplier with this email already exists');
            }
        }

        /**
         * Check if a supplier with the same phone number already exists
         * If it does, throw a ConflictException
         */
        if (phone) {
            const existingSupplier = await this.prisma.supplier.findUnique({
                where: {
                    phone,
                },
            });

            if (existingSupplier) {
                throw new ConflictException('Supplier with this phone already exists');
            }
        }

        /**
         * Create a new supplier in the database
         */
        const supplier = await this.prisma.supplier.create({
            data: {
                name,

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
            },
        });

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

import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { CreateDiscountDto } from '../dto/requests/create-discount.dto';
import { DiscountResponseDto } from '../dto/responses/discount-response.dto';

@Injectable()
export class CreateDiscountService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        userId: string,
        createDiscountDto: CreateDiscountDto,
    ): Promise<DiscountResponseDto> {
        const { name, description, type, value, startDate, endDate, isActive } =
            createDiscountDto;

        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
            throw new BadRequestException('End date must be after start date');
        }

        const discount = await this.prisma.discount.create({
            data: {
                name: name.trim(),

                ...(description !== undefined && {
                    description: description.trim(),
                }),

                type,

                value,

                ...(startDate && {
                    startDate: new Date(startDate),
                }),

                ...(endDate && {
                    endDate: new Date(endDate),
                }),

                ...(isActive !== undefined && {
                    isActive,
                }),

                createdById: userId,
            },

            select: {
                id: true,
                name: true,
                description: true,
                type: true,
                value: true,
                startDate: true,
                endDate: true,
                isActive: true,
                createdById: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return {
            ...discount,
            value: discount.value.toString(),
        };
    }
}

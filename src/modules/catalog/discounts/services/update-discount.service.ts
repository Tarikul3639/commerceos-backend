import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { UpdateDiscountDto } from '../dto/requests/update-discount.dto';

@Injectable()
export class UpdateDiscountService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(discountId: string, updateDiscountDto: UpdateDiscountDto) {
        const discount = await this.prisma.discount.findFirst({
            where: {
                id: discountId,
                deletedAt: null,
            },
        });

        if (!discount) {
            throw new NotFoundException('Discount not found');
        }

        /**
         * Resolve dates.
         *
         * undefined = do not update
         * null = remove existing date
         * string = update with new date
         */
        const startDate =
            updateDiscountDto.startDate === undefined
                ? discount.startDate
                : updateDiscountDto.startDate === null
                    ? null
                    : new Date(updateDiscountDto.startDate);

        const endDate =
            updateDiscountDto.endDate === undefined
                ? discount.endDate
                : updateDiscountDto.endDate === null
                    ? null
                    : new Date(updateDiscountDto.endDate);

        /**
         * Validate date range.
         */
        if (startDate && endDate && startDate > endDate) {
            throw new BadRequestException('Start date must be before end date');
        }

        return this.prisma.discount.update({
            where: {
                id: discountId,
            },

            data: {
                ...(updateDiscountDto.name !== undefined && {
                    name: updateDiscountDto.name,
                }),

                ...(updateDiscountDto.description !== undefined && {
                    description: updateDiscountDto.description,
                }),

                ...(updateDiscountDto.type !== undefined && {
                    type: updateDiscountDto.type,
                }),

                ...(updateDiscountDto.value !== undefined && {
                    value: updateDiscountDto.value,
                }),

                ...(updateDiscountDto.startDate !== undefined && {
                    startDate:
                        updateDiscountDto.startDate === null
                            ? null
                            : new Date(updateDiscountDto.startDate),
                }),

                ...(updateDiscountDto.endDate !== undefined && {
                    endDate:
                        updateDiscountDto.endDate === null
                            ? null
                            : new Date(updateDiscountDto.endDate),
                }),

                ...(updateDiscountDto.isActive !== undefined && {
                    isActive: updateDiscountDto.isActive,
                }),
            },
        });
    }
}

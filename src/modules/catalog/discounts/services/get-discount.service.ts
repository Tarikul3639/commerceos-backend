import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { DiscountResponseDto } from '../dto/responses/discount-response.dto';

@Injectable()
export class GetDiscountService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async execute(
        discountId: string,
    ): Promise<DiscountResponseDto> {
        const discount =
            await this.prisma.discount.findFirst({
                where: {
                    id: discountId,
                    deletedAt: null,
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

        if (!discount) {
            throw new NotFoundException(
                'Discount not found',
            );
        }

        return {
            ...discount,
            value: discount.value.toString(),
        };
    }
}
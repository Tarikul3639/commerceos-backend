import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PurchaseStatus } from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

import {
    CancelPurchaseDto,
} from '../dto/requests/cancel-purchase.dto';

@Injectable()
export class CancelPurchaseService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async execute(
        purchaseId: string,
        /*
         * Optional cancellation reason
         */
        _cancelPurchaseDto?: CancelPurchaseDto,
    ): Promise<void> {
        const purchase =
            await this.prisma.purchase.findUnique({
                where: {
                    id: purchaseId,
                },

                select: {
                    id: true,
                    status: true,
                },
            });

        if (!purchase) {
            throw new NotFoundException(
                'Purchase not found',
            );
        }

        /*
         * Only pending purchases can be cancelled
         */
        if (
            purchase.status !==
            PurchaseStatus.PENDING
        ) {
            throw new BadRequestException(
                'Only pending purchases can be cancelled',
            );
        }

        await this.prisma.purchase.update({
            where: {
                id: purchaseId,
            },

            data: {
                status:
                    PurchaseStatus.CANCELLED,
            },
        });
    }
}
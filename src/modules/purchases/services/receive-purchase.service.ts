import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PurchaseStatus } from '@/lib/prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ReceivePurchaseDto } from '../dto/requests/receive-purchase.dto';

@Injectable()
export class ReceivePurchaseService {
    constructor(private readonly prisma: PrismaService) {}

    async execute(purchaseId: string, _userId: string, _dto: ReceivePurchaseDto) {
        const purchase = await this.prisma.purchase.findUnique({
            where: { id: purchaseId },
            include: { purchaseItems: true },
        });
        if (!purchase) throw new NotFoundException('Purchase not found');
        if (purchase.status === PurchaseStatus.RECEIVED) throw new BadRequestException('Purchase has already been received');
        if (purchase.status === PurchaseStatus.CANCELLED) throw new BadRequestException('Cancelled purchase cannot be received');
        return this.prisma.$transaction(async (tx) => {
            for (const item of purchase.purchaseItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } },
                });
            }
            return tx.purchase.update({
                where: { id: purchaseId },
                data: { status: PurchaseStatus.RECEIVED },
                include: {
                    supplier: { select: { id: true, name: true } },
                    purchaseItems: { include: { product: { select: { id: true, name: true, sku: true } } } },
                },
            });
        });
    }
}

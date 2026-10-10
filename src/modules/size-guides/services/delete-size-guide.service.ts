import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class DeleteSizeGuideService {
    constructor(private readonly prisma: PrismaService) { }

    /** Delete an unused size guide */
    async execute(id: string): Promise<{ message: string }> {
        const sizeGuide = await this.prisma.sizeGuide.findUnique({
            where: { id },
            select: {
                id: true,
                _count: { select: { products: true } },
            },
        });

        if (!sizeGuide) {
            throw new NotFoundException('Size guide not found');
        }

        if (sizeGuide._count.products > 0) {
            throw new ConflictException(
                'Cannot delete a size guide assigned to products',
            );
        }

        await this.prisma.sizeGuide.delete({
            where: { id },
        });

        return { message: 'Size guide deleted successfully' };
    }
}

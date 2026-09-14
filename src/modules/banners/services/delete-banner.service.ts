import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class DeleteBannerService {
    constructor(private readonly prisma: PrismaService) {}

    async execute(
        bannerId: string,
    ): Promise<void> {
        const banner = await this.prisma.banner.findUnique({
            where: {
                id: bannerId,
            },
        });

        if (!banner) {
            throw new NotFoundException(
                'Banner not found',
            );
        }

        await this.prisma.banner.delete({
            where: {
                id: bannerId,
            },
        });
    }
}
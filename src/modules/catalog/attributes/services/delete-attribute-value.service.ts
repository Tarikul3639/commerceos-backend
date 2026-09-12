import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class DeleteAttributeValueService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(valueId: string): Promise<void> {
        const attributeValue = await this.prisma.attributeValue.findUnique({
            where: {
                id: valueId,
            },

            select: {
                id: true,

                _count: {
                    select: {
                        variantValues: true,
                    },
                },
            },
        });

        if (!attributeValue) {
            throw new NotFoundException('Attribute value not found');
        }

        if (attributeValue._count.variantValues > 0) {
            throw new BadRequestException(
                'Cannot delete an attribute value that is used by product variants',
            );
        }

        await this.prisma.attributeValue.delete({
            where: {
                id: valueId,
            },
        });
    }
}

import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class DeleteAttributeService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(attributeId: string): Promise<void> {
        const attribute = await this.prisma.attribute.findUnique({
            where: {
                id: attributeId,
            },

            select: {
                id: true,

                values: {
                    select: {
                        _count: {
                            select: {
                                variantValues: true,
                            },
                        },
                    },
                },
            },
        });

        if (!attribute) {
            throw new NotFoundException('Attribute not found');
        }

        const isUsedByVariants = attribute.values.some(
            (value) => value._count.variantValues > 0,
        );

        if (isUsedByVariants) {
            throw new BadRequestException(
                'Cannot delete an attribute that is used by product variants',
            );
        }

        await this.prisma.attribute.delete({
            where: {
                id: attributeId,
            },
        });
    }
}

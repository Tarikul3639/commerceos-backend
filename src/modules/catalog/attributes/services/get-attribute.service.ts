import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { AttributeResponseDto } from '../dto/responses/attribute-response.dto';

@Injectable()
export class GetAttributeService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(attributeId: string): Promise<AttributeResponseDto> {
        const attribute = await this.prisma.attribute.findUnique({
            where: {
                id: attributeId,
            },

            include: {
                values: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });

        if (!attribute) {
            throw new NotFoundException('Attribute not found');
        }

        return attribute;
    }
}

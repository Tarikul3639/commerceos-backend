import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { AttributeResponseDto } from '../dto/responses/attribute-response.dto';

@Injectable()
export class GetAttributesService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async execute(): Promise<AttributeResponseDto[]> {
        return this.prisma.attribute.findMany({
            include: {
                values: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },

            orderBy: {
                name: 'asc',
            },
        });
    }
}
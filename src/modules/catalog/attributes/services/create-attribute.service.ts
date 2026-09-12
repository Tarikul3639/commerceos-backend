import { ConflictException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { CreateAttributeDto } from '../dto/requests/create-attribute.dto';
import { AttributeResponseDto } from '../dto/responses/attribute-response.dto';

@Injectable()
export class CreateAttributeService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        createAttributeDto: CreateAttributeDto,
    ): Promise<AttributeResponseDto> {
        const name = createAttributeDto.name.trim();

        const existingAttribute = await this.prisma.attribute.findUnique({
            where: {
                name,
            },

            select: {
                id: true,
            },
        });

        if (existingAttribute) {
            throw new ConflictException('Attribute name already exists');
        }

        const attribute = await this.prisma.attribute.create({
            data: {
                name,
            },

            include: {
                values: true,
            },
        });

        return attribute;
    }
}

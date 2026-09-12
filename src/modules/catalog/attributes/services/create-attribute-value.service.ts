import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { CreateAttributeValueDto } from '../dto/requests/create-attribute-value.dto';
import { AttributeValueResponseDto } from '../dto/responses/attribute-value-response.dto';

@Injectable()
export class CreateAttributeValueService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        attributeId: string,
        createAttributeValueDto: CreateAttributeValueDto,
    ): Promise<AttributeValueResponseDto> {
        const attribute = await this.prisma.attribute.findUnique({
            where: {
                id: attributeId,
            },

            select: {
                id: true,
            },
        });

        if (!attribute) {
            throw new NotFoundException('Attribute not found');
        }

        const value = createAttributeValueDto.value.trim();

        const existingValue = await this.prisma.attributeValue.findUnique({
            where: {
                attributeId_value: {
                    attributeId,
                    value,
                },
            },

            select: {
                id: true,
            },
        });

        if (existingValue) {
            throw new ConflictException('Attribute value already exists');
        }

        return this.prisma.attributeValue.create({
            data: {
                value,
                minimumStock: createAttributeValueDto.minimumStock ?? 0,
                attributeId,
            },
        });
    }
}

import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { UpdateAttributeValueDto } from '../dto/requests/update-attribute-value.dto';
import { AttributeValueResponseDto } from '../dto/responses/attribute-value-response.dto';

@Injectable()
export class UpdateAttributeValueService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        valueId: string,
        updateAttributeValueDto: UpdateAttributeValueDto,
    ): Promise<AttributeValueResponseDto> {
        const attributeValue = await this.prisma.attributeValue.findUnique({
            where: {
                id: valueId,
            },

            select: {
                id: true,
                value: true,
                attributeId: true,
            },
        });

        if (!attributeValue) {
            throw new NotFoundException('Attribute value not found');
        }

        if (updateAttributeValueDto.value !== undefined) {
            const value = updateAttributeValueDto.value.trim();

            if (value !== attributeValue.value) {
                const existingValue = await this.prisma.attributeValue.findUnique({
                    where: {
                        attributeId_value: {
                            attributeId: attributeValue.attributeId,

                            value,
                        },
                    },

                    select: {
                        id: true,
                    },
                });

                if (existingValue && existingValue.id !== valueId) {
                    throw new ConflictException('Attribute value already exists');
                }
            }
        }

        return this.prisma.attributeValue.update({
            where: {
                id: valueId,
            },

            data: {
                ...(updateAttributeValueDto.value !== undefined && {
                    value: updateAttributeValueDto.value.trim(),
                }),

                ...(updateAttributeValueDto.minimumStock !== undefined && {
                    minimumStock: updateAttributeValueDto.minimumStock,
                }),
            },
        });
    }
}

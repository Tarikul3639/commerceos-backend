import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { UpdateAttributeDto } from '../dto/requests/update-attribute.dto';
import { AttributeResponseDto } from '../dto/responses/attribute-response.dto';

@Injectable()
export class UpdateAttributeService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        attributeId: string,
        updateAttributeDto: UpdateAttributeDto,
    ): Promise<AttributeResponseDto> {
        const attribute = await this.prisma.attribute.findUnique({
            where: {
                id: attributeId,
            },

            select: {
                id: true,
                name: true,
            },
        });

        if (!attribute) {
            throw new NotFoundException('Attribute not found');
        }

        if (updateAttributeDto.name !== undefined) {
            const name = updateAttributeDto.name.trim();

            if (name !== attribute.name) {
                const existingAttribute = await this.prisma.attribute.findUnique({
                    where: {
                        name,
                    },

                    select: {
                        id: true,
                    },
                });

                if (existingAttribute && existingAttribute.id !== attributeId) {
                    throw new ConflictException('Attribute name already exists');
                }
            }
        }

        return this.prisma.attribute.update({
            where: {
                id: attributeId,
            },

            data: {
                ...(updateAttributeDto.name !== undefined && {
                    name: updateAttributeDto.name.trim(),
                }),
            },

            include: {
                values: true,
            },
        });
    }
}

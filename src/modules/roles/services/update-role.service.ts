import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { UpdateRoleDto } from '../dto/requests/update-role.dto';

@Injectable()
export class UpdateRoleService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(roleId: string, updateRoleDto: UpdateRoleDto) {
        const role = await this.prisma.role.findUnique({
            where: {
                id: roleId,
            },
        });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        if (updateRoleDto.name !== undefined && updateRoleDto.name !== role.name) {
            const existingRole = await this.prisma.role.findUnique({
                where: {
                    name: updateRoleDto.name,
                },
            });

            if (existingRole) {
                throw new ConflictException('Role name already exists');
            }
        }

        return this.prisma.role.update({
            where: {
                id: roleId,
            },

            data: {
                ...(updateRoleDto.name !== undefined && {
                    name: updateRoleDto.name,
                }),

                ...(updateRoleDto.description !== undefined && {
                    description: updateRoleDto.description,
                }),
            },
        });
    }
}

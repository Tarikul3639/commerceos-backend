import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { AssignPermissionsDto } from '../dto/requests/assign-permissions.dto';

@Injectable()
export class AssignPermissionsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(roleId: string, dto: AssignPermissionsDto): Promise<void> {
        const role = await this.prisma.role.findUnique({
            where: {
                id: roleId,
            },

            select: {
                id: true,
            },
        });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        await this.prisma.$transaction(async (tx) => {

            // Remove existing permissions
            await tx.rolePermission.deleteMany({
                where: {
                    roleId,
                },
            });

            // Assign new permissions
            await tx.rolePermission.createMany({
                data: dto.permissions.map((permission) => ({
                    roleId,
                    permission,
                })),
            });
        });
    }
}

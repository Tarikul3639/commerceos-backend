import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { RoleName } from '../../../lib/prisma/client';

@Injectable()
export class DeleteRoleService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(roleId: string): Promise<void> {
        const role = await this.prisma.role.findUnique({
            where: {
                id: roleId,
            },

            select: {
                id: true,
                name: true,

                _count: {
                    select: {
                        users: true,
                    },
                },
            },
        });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        if (role.name === RoleName.SUPER_ADMIN) {
            throw new BadRequestException('SUPER_ADMIN role cannot be deleted');
        }

        if (role._count.users > 0) {
            throw new BadRequestException(
                'Cannot delete a role assigned to users. Firstly reassign the users to a different role and then delete this role.',
            );
        }

        await this.prisma.role.delete({
            where: {
                id: roleId,
            },
        });
    }
}

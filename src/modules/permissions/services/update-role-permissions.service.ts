import { Injectable } from '@nestjs/common'
import { Permission, Role } from '@/lib/prisma/enums'

import { PrismaService } from '@/common/prisma/prisma.service'

@Injectable()
export class UpdateRolePermissionsService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async execute(
        role: Role,
        permissions: Permission[],
    ) {
        const uniquePermissions = [...new Set(permissions)]

        return this.prisma.$transaction(async (tx) => {
            // Remove permissions that are no longer selected
            await tx.rolePermission.deleteMany({
                where: {
                    role,
                    permission: {
                        notIn: uniquePermissions,
                    },
                },
            })

            // Add newly selected permissions
            if (uniquePermissions.length > 0) {
                await tx.rolePermission.createMany({
                    data: uniquePermissions.map((permission) => ({
                        role,
                        permission,
                    })),
                    skipDuplicates: true,
                })
            }

            const updatedPermissions = await tx.rolePermission.findMany({
                where: {
                    role,
                },
                select: {
                    permission: true,
                },
                orderBy: {
                    permission: 'asc',
                },
            })

            return {
                role,
                permissions: updatedPermissions.map(
                    (item) => item.permission,
                ),
            }
        })
    }
}
import { ApiProperty } from '@nestjs/swagger'
import { Permission, Role } from '@/lib/prisma/enums'

export class RolePermissionsResponseDto {
    @ApiProperty({
        description: 'Role whose permissions are being returned.',
        enum: Role,
        example: Role.EMPLOYEE,
    })
    role!: Role

    @ApiProperty({
        description: 'Permissions assigned to the role.',
        enum: Permission,
        isArray: true,
        example: [
            Permission.PRODUCT_READ,
            Permission.ORDER_CREATE,
            Permission.STOCK_READ,
        ],
    })
    permissions!: Permission[]
}
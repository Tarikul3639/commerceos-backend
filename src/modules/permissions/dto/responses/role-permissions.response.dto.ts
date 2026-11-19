import { ApiProperty } from '@nestjs/swagger';
import { Permission, Role } from '../../../../infrastructure/database/generated/prisma/enums.js';

export const UserRole = [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE] as const;

export type UserRole = (typeof UserRole)[number];

export class RolePermissionsResponseDto {
  @ApiProperty({
    description: 'Role whose permissions are being returned.',
    enum: UserRole,
    example: UserRole[0],
  })
  role!: UserRole;

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
  permissions!: Permission[];
}

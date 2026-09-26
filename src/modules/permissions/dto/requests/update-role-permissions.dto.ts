import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '@/lib/prisma/enums';
import { ArrayUnique, IsArray, IsEnum } from 'class-validator';

export class UpdateRolePermissionsDto {
    @ApiProperty({
        description:
            'Complete list of permissions that should be assigned to the role.',
        enum: Permission,
        isArray: true,
        example: [
            Permission.PRODUCT_READ,
            Permission.ORDER_CREATE,
            Permission.STOCK_READ,
        ],
    })
    @IsArray()
    @ArrayUnique()
    @IsEnum(Permission, {
        each: true,
    })
    permissions!: Permission[];
}

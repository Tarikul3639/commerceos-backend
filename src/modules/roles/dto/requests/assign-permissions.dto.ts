import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { PermissionName } from '../../../../lib/prisma/client';

export class AssignPermissionsDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsEnum(PermissionName, {
        each: true,
    })
    @ApiProperty({
        description: 'List of permissions to assign to the role',   
        example: [PermissionName.USER_READ, PermissionName.USER_CREATE],
        enum: PermissionName,
        isArray: true,
    })
    permissions!: PermissionName[];
}

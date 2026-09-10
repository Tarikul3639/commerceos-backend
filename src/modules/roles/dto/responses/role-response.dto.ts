import {
    PermissionName,
    RoleName,
} from '../../../../lib/prisma/client';

import {
    ApiProperty,
} from '@nestjs/swagger';

export class RoleResponseDto {
    @ApiProperty({
        example: 'cmf123456789',
    })
    id!: string;

    @ApiProperty({
        enum: RoleName,
        example: RoleName.MANAGER,
    })
    name!: RoleName;

    @ApiProperty({
        example: 'Manages daily business operations',
        nullable: true,
    })
    description!: string | null;

    @ApiProperty({
        enum: PermissionName,
        isArray: true,

        example: [
            PermissionName.USER_READ,
            PermissionName.USER_CREATE,
        ],
    })
    permissions!: PermissionName[];

    @ApiProperty({
        example: 5,
    })
    userCount!: number;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
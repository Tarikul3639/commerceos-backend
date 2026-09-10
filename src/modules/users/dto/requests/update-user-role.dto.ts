import {
    IsNotEmpty,
    IsString,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The role ID to assign to the user',
        example: 'cmf123456789',
    })
    roleId!: string;
}
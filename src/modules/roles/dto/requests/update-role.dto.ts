import {
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

import { RoleName } from '../../../../lib/prisma/client';

export class UpdateRoleDto {
    @IsOptional()
    @IsEnum(RoleName)
    @ApiPropertyOptional({
        description: 'The name of the role',
        enum: RoleName,
        example: RoleName.MANAGER,
    })
    name?: RoleName;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    @ApiPropertyOptional({
        description: 'A description of the role',
        example: 'Manages daily business operations',
    })
    description?: string;
}
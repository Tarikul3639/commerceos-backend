import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import { RoleName } from '../../../../lib/prisma/client';

export class CreateRoleDto {
    @IsEnum(RoleName)
    @IsNotEmpty()
    @ApiProperty({
        description: 'The name of the role',
        enum: RoleName,
        example: RoleName.MANAGER,
    })
    name!: RoleName;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    @ApiPropertyOptional({
        description: 'A description of the role',
        example: 'Manages daily business operations',
    })
    description?: string;
}
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { UserStatus } from '../../../../lib/prisma/client';

export class UpdateUserStatusDto {
    @IsEnum(UserStatus)
    @ApiProperty({
        description: 'The status of the user',
        enum: UserStatus,
        example: UserStatus.ACTIVE,
    })
    status!: UserStatus;
}
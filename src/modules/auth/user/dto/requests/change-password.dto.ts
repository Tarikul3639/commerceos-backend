import { ApiProperty } from '@nestjs/swagger';

import {
    IsNotEmpty,
    IsString,
    MinLength,
} from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({
        example: 'CurrentPassword123!',
        description:
            'Current account password',
    })
    @IsString()
    @IsNotEmpty()
    currentPassword!: string;

    @ApiProperty({
        example: 'NewSecurePassword123!',
        description:
            'New password for the account',
        minLength: 8,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    newPassword!: string;
}
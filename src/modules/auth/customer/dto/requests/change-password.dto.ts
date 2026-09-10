import {
    IsNotEmpty,
    IsString,
    MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
    @ApiProperty({
        example: 'OldPassword@123',
        description: 'Current password of the customer',
    })
    @IsString()
    @IsNotEmpty()
    currentPassword!: string;

    @ApiProperty({
        example: 'NewPassword@123',
        description: 'New password for the customer',
        minLength: 8,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    newPassword!: string;
}
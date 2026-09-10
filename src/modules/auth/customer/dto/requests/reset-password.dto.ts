import { ApiProperty } from '@nestjs/swagger';

import {
    IsNotEmpty,
    IsString,
    MinLength,
} from 'class-validator';

export class ResetPasswordDto {
    @ApiProperty({
        example: 'a1b2c3d4e5f67890abcdef1234567890',
        description:
            'Password reset token received via email',
    })
    @IsString()
    @IsNotEmpty()
    token!: string;

    @ApiProperty({
        example: 'NewSecurePassword123!',
        description:
            'New password for the account',
        minLength: 8,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password!: string;
}
import { ApiProperty } from '@nestjs/swagger';

import {
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class VerifyEmailDto {
    @ApiProperty({
        example: 'a1b2c3d4e5f67890abcdef1234567890',
        description:
            'Email verification token received via email',
    })
    @IsString()
    @IsNotEmpty()
    token!: string;
}
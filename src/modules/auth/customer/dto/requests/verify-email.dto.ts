// src/modules/auth/customer/dto/requests/verify-email.dto.ts

import { ApiProperty } from '@nestjs/swagger';

import {
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class VerifyEmailDto {
    @ApiProperty({
        description: 'Email verification token',
        example: 'abc123xyz456',
    })
    @IsString()
    @IsNotEmpty()
    token!: string;
}
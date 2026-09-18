import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class ResendVerificationEmailDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email address to resend the verification email',
    })
    @IsEmail()
    @IsNotEmpty()
    email!: string;
}

export class VerifyEmailDto {
    @ApiProperty({
        example: 'a1b2c3d4e5f67890abcdef1234567890',
        description: 'Email verification token received via email',
    })
    @IsString()
    @IsNotEmpty()
    token!: string;
}
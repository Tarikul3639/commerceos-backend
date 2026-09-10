import { ApiProperty } from '@nestjs/swagger';

import {
    IsEmail,
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class ForgotPasswordDto {
    @ApiProperty({
        example: 'user@example.com',
        description:
            'Email address associated with the account',
    })
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email!: string;
}
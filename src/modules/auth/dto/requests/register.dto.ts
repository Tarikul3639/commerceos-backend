import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    @ApiProperty({
        description: 'The first name of the user',
        example: 'John',
    })
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    @ApiProperty({
        description: 'The last name of the user',
        example: 'Doe',
    })
    lastName: string;

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The email address of the user',
        example: 'user@example.com',
    })
    email: string;

    @IsOptional()
    @IsPhoneNumber()
    @ApiProperty({
        description: 'The phone number of the user',
        example: '+1234567890',
    })
    phone?: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(100)
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=])[A-Za-z\d@$!%*?&^#()_\-+=]+$/,
        {
            message:
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        },
    )
    @ApiProperty({
        description: 'The password of the user',
        example: 'Password123!',
    })
    password: string;
}

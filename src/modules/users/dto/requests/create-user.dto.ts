import {
    IsEnum,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@/lib/prisma/enums';

export const UserRole = [
    Role.ADMIN,
    Role.MANAGER,
    Role.EMPLOYEE,
] as const;
export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    @ApiProperty({
        description: 'The full name of the user',
        example: 'John Doe',
    })
    name!: string;

    @IsEmail()
    @IsNotEmpty()
    @MaxLength(255)
    @ApiProperty({
        description: 'The email address of the user',
        example: 'user@example.com',
    })
    email!: string;

    @IsOptional()
    @IsPhoneNumber("BD")
    @ApiPropertyOptional({
        description: 'The phone number of the user',
        example: '+8801712345678',
    })
    phone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    @IsUrl()
    @ApiPropertyOptional({
        description: "The URL of the user's avatar image",
        example: 'https://example.com/avatar.jpg',
    })
    avatar?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        description: "The public ID of the user's avatar image in Cloudinary",
        example: 'avatar_public_id',
    })
    publicId?: string;

    @IsEnum(UserRole)
    @IsNotEmpty()
    @ApiProperty({
        description: 'The fixed role assigned to the user',
        enum: UserRole,
        example: UserRole[0],
    })
    role!: Role;
}

import { ApiProperty } from '@nestjs/swagger';
import { Permission, Role } from '../../../../../lib/prisma/client';

export class CurrentUserResponseDto {
    @ApiProperty({
        example: 'cm123abc456',
    })
    id!: string;

    @ApiProperty({
        example: 'Tarikul Islam',
    })
    name!: string;

    @ApiProperty({
        example: 'tarikul@example.com',
    })
    email!: string;

    @ApiProperty({
        example: '+8801712345678',
        nullable: true,
    })
    phone!: string | null;

    @ApiProperty({
        example: 'https://res.cloudinary.com/example/avatar.jpg',
        nullable: true,
    })
    avatar!: string | null;

    @ApiProperty({
        enum: Role,
        example: Role.ADMIN,
    })
    role!: Role;

    @ApiProperty({
        enum: Permission,
        isArray: true,
        example: [
            Permission.PRODUCT_READ,
            Permission.PRODUCT_CREATE,
            Permission.ORDER_READ,
        ],
    })
    permissions!: Permission[];

    @ApiProperty({
        example: true,
    })
    isVerified!: boolean;

    @ApiProperty({
        example: '2026-09-18T16:30:00.000Z',
        nullable: true,
    })
    lastLoginAt!: Date | null;
}
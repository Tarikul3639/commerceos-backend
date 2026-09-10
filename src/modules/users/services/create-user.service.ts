import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateUserDto } from '../dto/requests/create-user.dto';
import { UserResponseDto } from '../dto/responses/user-response.dto';

@Injectable()
export class CreateUserService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const { name, email, phone, avatar, password, roleId } = createUserDto;

        const user = await this.prisma.user.create({
            data: {
                name,
                email,
                password,
                roleId,
                ...(phone && { phone }),
                ...(avatar && { avatar }),
            },
        });

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            status: user.status,
            isVerified: user.isVerified,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
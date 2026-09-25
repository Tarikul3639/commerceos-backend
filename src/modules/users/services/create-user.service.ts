import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { CreateUserDto } from '../dto/requests/create-user.dto';
import { UserResponseDto } from '../dto/responses/user-response.dto';

import { MailService } from '../../../common/mail/mail.service';
import { hashPassword } from '../../../common/utils/password.util';

@Injectable()
export class CreateUserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly mailService: MailService,
    ) { }

    async execute(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const { name, email, phone, avatar, roleId } = createUserDto;

        const existingUser = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        if (phone) {
            const existingPhoneUser = await this.prisma.user.findUnique({
                where: {
                    phone,
                },
            });

            if (existingPhoneUser) {
                throw new ConflictException(
                    'User with this phone number already exists',
                );
            }
        }

        // Generate secure random password
        const temporaryPassword = randomBytes(32).toString('base64url');

        // Hash password before storing
        const passwordHash = await hashPassword(
            temporaryPassword,
            this.configService.getOrThrow<number>('bcrypt.saltRounds'),
        );

        const user = await this.prisma.user.create({
            data: {
                name,
                email,
                password: passwordHash,
                roleId,
                ...(phone && { phone }),
                ...(avatar && { avatar }),
            },

            include: {
                role: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        const frontendUrl =
            this.configService.getOrThrow<string>('app.frontendUrl');

        await this.mailService.sendWelcomeEmail(user.email, {
            appName: this.configService.getOrThrow<string>('app.name'),
            name: user.name,
            loginUrl: `${frontendUrl}/login`,
            year: new Date().getFullYear(),
        });

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            role: user.role.name,
            status: user.status,
            isVerified: user.isVerified,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}

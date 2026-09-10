import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { RegisterDto } from '../dto/requests/register.dto';

import { hashPassword } from '../../../../common/utils/password.util';

@Injectable()
export class CustomerRegisterService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
    ) { }

    async execute(dto: RegisterDto): Promise<void> {
        const { name, email, password } = dto;

        const existingCustomer = await this.prismaService.customer.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
            },
        });

        if (existingCustomer) {
            throw new ConflictException('An account with this email already exists.');
        }

        const hashedPassword = await hashPassword(
            password,
            this.configService.getOrThrow<number>('bcrypt.saltRounds'),
        );

        await this.prismaService.customer.create({
            data: {
                name,
                email,
                password: hashedPassword,

                isVerified: false,
            },
        });
    }
}

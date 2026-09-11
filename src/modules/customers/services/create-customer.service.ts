import {
    ConflictException,
    Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { hashPassword } from '../../../common/utils/password.util';
import { CreateCustomerDto } from '../dto/requests/create-customer.dto';

@Injectable()
export class CreateCustomerService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) { }

    async execute(createCustomerDto: CreateCustomerDto) {
        const { name, email, phone, password, address } = createCustomerDto;

        const existingCustomer = await this.prisma.customer.findFirst({
            where: {
                OR: [
                    { email },
                    ...(phone !== undefined ? [{ phone }] : []),
                ],
            },
            select: {
                id: true,
                email: true,
                phone: true,
            },
        });

        if (existingCustomer) {
            if (existingCustomer.email === email) {
                throw new ConflictException('Email already exists');
            }

            if (phone !== undefined && existingCustomer.phone === phone) {
                throw new ConflictException('Phone number already exists');
            }
        }

        const hashedPassword = await hashPassword(
            password,
            this.configService.getOrThrow<number>('bcrypt.saltRounds'),
        );

        return this.prisma.customer.create({
            data: {
                name,
                email,
                ...(phone !== undefined && { phone }),
                password: hashedPassword,
                ...(address !== undefined && { address }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                status: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
}
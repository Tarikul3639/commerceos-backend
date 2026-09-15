import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateEmployeeDto } from '../dto/requests/create-employee.dto';

@Injectable()
export class CreateEmployeeService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(dto: CreateEmployeeDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: dto.userId,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const existingEmployee = await this.prisma.employee.findUnique({
            where: {
                userId: dto.userId,
            },
        });

        if (existingEmployee) {
            throw new ConflictException(
                'Employee profile already exists for this user',
            );
        }

        return this.prisma.employee.create({
            data: {
                designation: dto.designation,

                ...(dto.salary !== undefined && {
                    salary: dto.salary,
                }),

                joiningDate: new Date(dto.joiningDate),

                user: {
                    connect: {
                        id: dto.userId,
                    },
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
}

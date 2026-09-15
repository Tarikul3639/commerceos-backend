import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { EmployeeResponseDto } from '../dto/responses/employee-response.dto';

@Injectable()
export class GetEmployeeService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async execute(
        id: string,
    ): Promise<EmployeeResponseDto> {
        const employee =
            await this.prisma.employee.findUnique({
                where: {
                    id,
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

        if (!employee) {
            throw new NotFoundException(
                'Employee not found',
            );
        }

        return {
            id: employee.id,
            designation: employee.designation,
            salary: employee.salary
                ? employee.salary.toString()
                : null,
            joiningDate: employee.joiningDate,
            userId: employee.userId,

            user: {
                id: employee.user.id,
                name: employee.user.name,
                email: employee.user.email,
            },

            createdAt: employee.createdAt,
            updatedAt: employee.updatedAt,
        };
    }
}
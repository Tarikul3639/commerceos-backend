import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { UpdateEmployeeDto } from '../dto/requests/update-employee.dto';
import { EmployeeResponseDto } from '../dto/responses/employee-response.dto';

@Injectable()
export class UpdateEmployeeService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        id: string,
        dto: UpdateEmployeeDto,
    ): Promise<EmployeeResponseDto> {
        const employee = await this.prisma.employee.findUnique({
            where: {
                id,
            },
        });

        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        const updatedEmployee = await this.prisma.employee.update({
            where: {
                id,
            },
            data: {
                ...(dto.designation !== undefined && {
                    designation: dto.designation,
                }),

                ...(dto.salary !== undefined && {
                    salary: dto.salary,
                }),

                ...(dto.joiningDate !== undefined && {
                    joiningDate: new Date(dto.joiningDate),
                }),
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

        return {
            id: updatedEmployee.id,
            designation: updatedEmployee.designation,

            salary: updatedEmployee.salary ? updatedEmployee.salary.toString() : null,

            joiningDate: updatedEmployee.joiningDate,
            userId: updatedEmployee.userId,

            user: {
                id: updatedEmployee.user.id,
                name: updatedEmployee.user.name,
                email: updatedEmployee.user.email,
            },

            createdAt: updatedEmployee.createdAt,
            updatedAt: updatedEmployee.updatedAt,
        };
    }
}

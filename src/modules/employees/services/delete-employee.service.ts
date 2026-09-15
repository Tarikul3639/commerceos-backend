import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class DeleteEmployeeService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(id: string) {
        const employee = await this.prisma.employee.findUnique({
            where: {
                id,
            },
        });

        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        await this.prisma.employee.delete({
            where: {
                id,
            },
        });

        return {
            message: 'Employee deleted successfully',
        };
    }
}

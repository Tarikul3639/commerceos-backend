import {
    ConflictException,
    Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { CreateRoleDto } from '../dto/requests/create-role.dto';

@Injectable()
export class CreateRoleService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async execute(
        createRoleDto: CreateRoleDto,
    ) {
        const existingRole = await this.prisma.role.findUnique({
            where: {
                name: createRoleDto.name,
            },
        });

        if (existingRole) {
            throw new ConflictException(
                'Role already exists',
            );
        }

        return this.prisma.role.create({
            data: {
                name: createRoleDto.name,

                ...(createRoleDto.description !== undefined && {
                    description: createRoleDto.description,
                }),
            },
        });
    }
}
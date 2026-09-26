import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Request,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Permission, Role } from '@/lib/prisma/enums';

import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
// import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';

import { GetPermissionsService } from '../services/get-permissions.service';
import { UpdateRolePermissionsService } from '../services/update-role-permissions.service';
import { UpdateRolePermissionsDto } from '../dto/requests/update-role-permissions.dto';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class PermissionsController {
    constructor(
        private readonly getPermissionsService: GetPermissionsService,
        private readonly updateRolePermissionsService: UpdateRolePermissionsService,
    ) { }

    @Get('me')
    @Permissions(Permission.PERMISSION_READ)
    @ApiOperation({
        summary: 'Get current user permissions',
        description:
            'Returns the authenticated user role and all permissions assigned to that role.',
    })
    @ApiResponse({
        status: 200,
        description: 'Current user permissions retrieved successfully.',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized.',
    })
    @ApiResponse({
        status: 403,
        description: 'Permission denied.',
    })
    async getMyPermissions(
        @Request()
        req: Request & {
            user: {
                role: Role;
            };
        },
    ) {
        return this.getPermissionsService.getMyPermissions(req.user.role);
    }

    @Get('roles/:role')
    @Permissions(Permission.PERMISSION_READ)
    @ApiOperation({
        summary: 'Get permissions of a role',
        description:
            'Returns all permissions currently assigned to the specified role.',
    })
    @ApiParam({
        name: 'role',
        enum: Role,
        description: 'Fixed system role.',
        example: Role.EMPLOYEE,
    })
    @ApiResponse({
        status: 200,
        description: 'Role permissions retrieved successfully.',
        schema: {
            example: {
                role: 'EMPLOYEE',
                permissions: ['PRODUCT_READ', 'ORDER_CREATE', 'STOCK_READ'],
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid role.',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized.',
    })
    @ApiResponse({
        status: 403,
        description: 'Permission denied.',
    })
    async getRolePermissions(@Param('role') role: Role) {
        return this.getPermissionsService.getRolePermissions(role);
    }

    @Patch('roles/:role')
    @Permissions(Permission.PERMISSION_UPDATE)
    @ApiOperation({
        summary: 'Update role permissions',
        description: 'Replaces the complete permission set assigned to a role.',
    })
    @ApiParam({
        name: 'role',
        enum: Role,
        description: 'Fixed system role.',
        example: Role.EMPLOYEE,
    })
    @ApiBody({
        type: UpdateRolePermissionsDto,
        examples: {
            employeePermissions: {
                summary: 'Assign permissions to EMPLOYEE',
                value: {
                    permissions: ['PRODUCT_READ', 'ORDER_CREATE', 'STOCK_READ'],
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Role permissions updated successfully.',
        schema: {
            example: {
                role: 'EMPLOYEE',
                permissions: ['PRODUCT_READ', 'ORDER_CREATE', 'STOCK_READ'],
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid role or permission.',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized.',
    })
    @ApiResponse({
        status: 403,
        description: 'Permission denied.',
    })
    async updateRolePermissions(
        @Param('role') role: Role,
        @Body() dto: UpdateRolePermissionsDto,
    ) {
        return this.updateRolePermissionsService.execute(role, dto.permissions);
    }
}

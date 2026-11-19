import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
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
import { Permission, Role } from '../../../infrastructure/database/generated/prisma/enums.js';

import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Permissions } from '../../../common/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
// import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { UserJwtAuthGuard } from '../../../common/guards/user-jwt-auth.guard.js';

import { GetPermissionsService } from '../services/get-permissions.service.js';
import { GetRolesPermissionsService } from '../services/get-roles-permissions.service.js';
import { UpdateRolePermissionsService } from '../services/update-role-permissions.service.js';

import { RolePermissionsResponseDto } from '../dto/responses/role-permissions.response.dto.js';
import { UpdateRolePermissionsDto } from '../dto/requests/update-role-permissions.dto.js';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class PermissionsController {
  constructor(
    private readonly getPermissionsService: GetPermissionsService,
    private readonly getRolesPermissionsService: GetRolesPermissionsService,
    private readonly updateRolePermissionsService: UpdateRolePermissionsService,
  ) {}

  @Get('me')
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

  @Get('roles')
  @Permissions(Permission.PERMISSION_READ)
  @ApiOperation({
    summary: 'Get all role permissions',
    description:
      'Returns all system roles and the permissions assigned to each role.',
  })
  @ApiResponse({
    status: 200,
    description: 'All role permissions retrieved successfully.',
    type: RolePermissionsResponseDto,
    isArray: true,
  })
  async getRolesPermissions() {
    return this.getRolesPermissionsService.execute();
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
  async getRolePermissions(@Param('role', new ParseEnumPipe(Role)) role: Role) {
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
    @Param('role', new ParseEnumPipe(Role)) role: Role,
    @Body() dto: UpdateRolePermissionsDto,
    @CurrentUser('role') actorRole: Role,
  ) {
    return this.updateRolePermissionsService.execute(
      role,
      dto.permissions,
      actorRole,
    );
  }
}

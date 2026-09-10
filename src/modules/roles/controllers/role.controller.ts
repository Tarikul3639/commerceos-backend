import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
} from '@nestjs/common';

import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

// DTOs
import { CreateRoleDto } from '../dto/requests/create-role.dto';
import { UpdateRoleDto } from '../dto/requests/update-role.dto';
import { AssignPermissionsDto } from '../dto/requests/assign-permissions.dto';

// Services
import { CreateRoleService } from '../services/create-role.service';
import { GetRolesService } from '../services/get-roles.service';
import { GetRoleService } from '../services/get-role.service';
import { UpdateRoleService } from '../services/update-role.service';
import { AssignPermissionsService } from '../services/assign-permissions.service';
import { DeleteRoleService } from '../services/delete-role.service';

@ApiTags('Roles')
@Controller('roles')
export class RoleController {
    constructor(
        private readonly createRoleService: CreateRoleService,
        private readonly getRolesService: GetRolesService,
        private readonly getRoleService: GetRoleService,
        private readonly updateRoleService: UpdateRoleService,
        private readonly assignPermissionsService: AssignPermissionsService,
        private readonly deleteRoleService: DeleteRoleService,
    ) { }

    /**
     * Create role
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new role',
    })
    async create(@Body() createRoleDto: CreateRoleDto) {
        const role = await this.createRoleService.execute(createRoleDto);

        return {
            message: 'Role created successfully',
            data: role,
        };
    }

    /**
     * Get all roles
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get all roles',
    })
    async findAll() {
        const roles = await this.getRolesService.execute();

        return {
            data: roles,
        };
    }

    /**
     * Get role by ID
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get role by ID',
    })
    @ApiParam({
        name: 'id',
        description: 'Role ID',
    })
    async findOne(@Param('id') roleId: string) {
        const role = await this.getRoleService.execute(roleId);

        return {
            data: role,
        };
    }

    /**
     * Update role
     */
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update role',
    })
    @ApiParam({
        name: 'id',
        description: 'Role ID',
    })
    async update(
        @Param('id') roleId: string,
        @Body() updateRoleDto: UpdateRoleDto,
    ) {
        const role = await this.updateRoleService.execute(roleId, updateRoleDto);

        return {
            message: 'Role updated successfully',
            data: role,
        };
    }

    /**
     * Replace role permissions
     */
    @Patch(':id/permissions')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Replace role permissions',
    })
    @ApiParam({
        name: 'id',
        description: 'Role ID',
    })
    async assignPermissions(
        @Param('id') roleId: string,
        @Body()
        assignPermissionsDto: AssignPermissionsDto,
    ) {
        await this.assignPermissionsService.execute(roleId, assignPermissionsDto);

        return {
            message: 'Permissions updated successfully',
        };
    }

    /**
     * Delete role
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete role',
    })
    @ApiParam({
        name: 'id',
        description: 'Role ID',
    })
    async remove(@Param('id') roleId: string): Promise<void> {
        await this.deleteRoleService.execute(roleId);
    }
}

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
    Query,
} from '@nestjs/common';

import {
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

// DTOs
import { CreateUserDto } from '../dto/requests/create-user.dto';
import { UpdateUserDto } from '../dto/requests/update-user.dto';
import { UpdateUserStatusDto } from '../dto/requests/update-user-status.dto';
import { UpdateUserRoleDto } from '../dto/requests/update-user-role.dto';
import { UserQueryDto } from '../dto/requests/user-query.dto';

// Services
import { CreateUserService } from '../services/create-user.service';
import { GetUsersService } from '../services/get-users.service';
import { GetUserService } from '../services/get-user.service';
import { UpdateUserService } from '../services/update-user.service';
import { UpdateUserStatusService } from '../services/update-user-status.service';
import { UpdateUserRoleService } from '../services/update-user-role.service';
import { DeleteUserService } from '../services/delete-user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(
        private readonly createUserService: CreateUserService,
        private readonly getUsersService: GetUsersService,
        private readonly getUserService: GetUserService,
        private readonly updateUserService: UpdateUserService,
        private readonly updateUserStatusService: UpdateUserStatusService,
        private readonly updateUserRoleService: UpdateUserRoleService,
        private readonly deleteUserService: DeleteUserService,
    ) { }

    /**
     * Create user
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new user',
    })
    async create(
        @Body() createUserDto: CreateUserDto,
    ) {
        const user = await this.createUserService.execute(
            createUserDto,
        );

        return {
            message: 'User created successfully',
            data: user,
        };
    }

    /**
     * Get all users
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get all users',
    })
    async findAll(
        @Query() query: UserQueryDto,
    ) {
        return this.getUsersService.execute(query);
    }

    /**
     * Get user by ID
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get user by ID',
    })
    @ApiParam({
        name: 'id',
        description: 'User ID',
    })
    async findOne(
        @Param('id') userId: string,
    ) {
        const user = await this.getUserService.execute(userId);

        return {
            data: user,
        };
    }

    /**
     * Update user
     */
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update user information',
    })
    async update(
        @Param('id') userId: string,

        @Body() updateUserDto: UpdateUserDto,
    ) {
        const user = await this.updateUserService.execute(
            userId,
            updateUserDto,
        );

        return {
            message: 'User updated successfully',
            data: user,
        };
    }

    /**
     * Update user status
     */
    @Patch(':id/status')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update user status',
    })
    async updateStatus(
        @Param('id') userId: string,

        @Body()
        updateUserStatusDto: UpdateUserStatusDto,
    ) {
        const user =
            await this.updateUserStatusService.execute(
                userId,
                updateUserStatusDto,
            );

        return {
            message: 'User status updated successfully',
            data: user,
        };
    }

    /**
     * Update user role
     */
    @Patch(':id/role')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update user role',
    })
    async updateRole(
        @Param('id') userId: string,

        @Body()
        updateUserRoleDto: UpdateUserRoleDto,
    ) {
        const user =
            await this.updateUserRoleService.execute(
                userId,
                updateUserRoleDto,
            );

        return {
            message: 'User role updated successfully',
            data: user,
        };
    }

    /**
     * Delete user
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete user',
    })
    async remove(
        @Param('id') userId: string,
    ): Promise<void> {
        await this.deleteUserService.execute(userId);
    }
}
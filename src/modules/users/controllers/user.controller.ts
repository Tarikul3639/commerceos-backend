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
    UseGuards,
} from '@nestjs/common';

import {
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

// DTOs
import { CreateUserDto } from '../dto/requests/create-user.dto';
import { UpdateUserDto } from '../dto/requests/update-user.dto';
import { UpdateUserStatusDto } from '../dto/requests/update-user-status.dto';
import { UserQueryDto } from '../dto/requests/user-query.dto';
import { UserListResponseDto } from '../dto/responses/user-list-response.dto';

// Services
import { CreateUserService } from '../services/create-user.service';
import { DeleteUserService } from '../services/delete-user.service';
import { GetUserService } from '../services/get-user.service';
import { GetUsersService } from '../services/get-users.service';
import { RestoreUserService } from '../services/restore-user.service';
import { UpdateUserService } from '../services/update-user.service';
import { UpdateUserStatusService } from '../services/update-user-status.service';

// Guards & Decorators
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';

// Prisma
import { Role } from '../../../lib/prisma/enums';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(
        private readonly createUserService: CreateUserService,
        private readonly getUsersService: GetUsersService,
        private readonly getUserService: GetUserService,
        private readonly updateUserService: UpdateUserService,
        private readonly updateUserStatusService: UpdateUserStatusService,
        private readonly deleteUserService: DeleteUserService,
        private readonly restoreUserService: RestoreUserService,
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
        const user =
            await this.createUserService.execute(
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
    @UseGuards(UserJwtAuthGuard, RolesGuard)
    @Roles(
        Role.SUPER_ADMIN,
        Role.ADMIN,
        Role.MANAGER,
        Role.EMPLOYEE,
    )
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of users',
        type: UserListResponseDto,
    })
    async findAll(
        @Query() query: UserQueryDto,
        @CurrentUser('role') requesterRole: Role,
    ) {
        return this.getUsersService.execute(
            query,
            requesterRole,
        );
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
        const user =
            await this.getUserService.execute(userId);

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
        const user =
            await this.updateUserService.execute(
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
    @UseGuards(UserJwtAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update user status',
    })
    @ApiParam({
        name: 'id',
        description: 'User ID',
    })
    async updateStatus(
        @Param('id') userId: string,
        @Body()
        updateUserStatusDto: UpdateUserStatusDto,
        @CurrentUser('id') requesterId: string,
    ) {
        const user =
            await this.updateUserStatusService.execute(
                userId,
                requesterId,
                updateUserStatusDto,
            );

        return {
            message: 'User status updated successfully',
            data: user,
        };
    }

    /**
     * Restore deleted user
     */
    @Patch(':id/restore')
    @UseGuards(UserJwtAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Restore deleted user',
    })
    @ApiParam({
        name: 'id',
        description: 'User ID',
    })
    async restore(
        @Param('id') userId: string,
    ) {
        const user =
            await this.restoreUserService.execute(
                userId,
            );

        return {
            message: 'User restored successfully',
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
    @ApiParam({
        name: 'id',
        description: 'User ID',
    })
    async remove(
        @Param('id') userId: string,
    ): Promise<void> {
        await this.deleteUserService.execute(
            userId,
        );
    }
}
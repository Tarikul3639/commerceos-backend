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
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from '../dto/requests/create-user.dto.js';
import { CreateEmployeeDto } from '../dto/requests/create-employee.dto.js';
import { UpdateUserDto } from '../dto/requests/update-user.dto.js';
import { UpdateUserStatusDto } from '../dto/requests/update-user-status.dto.js';
import { UserQueryDto } from '../dto/requests/user-query.dto.js';
import { UserListResponseDto } from '../dto/responses/user-list-response.dto.js';

import { CreateUserService } from '../services/create-user.service.js';
import { DeleteUserService } from '../services/delete-user.service.js';
import { GetUserService } from '../services/get-user.service.js';
import { GetUsersService } from '../services/get-users.service.js';
import { RestoreUserService } from '../services/restore-user.service.js';
import { UpdateUserService } from '../services/update-user.service.js';
import { UpdateUserStatusService } from '../services/update-user-status.service.js';

import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Permissions } from '../../../common/decorators/permissions.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { UserJwtAuthGuard } from '../../../common/guards/user-jwt-auth.guard.js';
import { Permission, Role } from '../../../infrastructure/database/generated/prisma/enums.js';

@ApiTags('Users')
@Controller('users')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class UserController {
  constructor(
    private readonly createUserService: CreateUserService,
    private readonly getUsersService: GetUsersService,
    private readonly getUserService: GetUserService,
    private readonly updateUserService: UpdateUserService,
    private readonly updateUserStatusService: UpdateUserStatusService,
    private readonly deleteUserService: DeleteUserService,
    private readonly restoreUserService: RestoreUserService,
  ) {}

  @Post('employees')
  @Permissions(Permission.USER_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a manager or employee account' })
  async createEmployee(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @CurrentUser('id') requesterId: string,
    @CurrentUser('role') requesterRole: Role,
  ) {
    const user = await this.createUserService.execute(
      createEmployeeDto,
      requesterId,
      requesterRole,
    );
    return { message: 'Employee created successfully', data: user };
  }

  @Post()
  @Permissions(Permission.USER_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser('id') requesterId: string,
    @CurrentUser('role') requesterRole: Role,
  ) {
    const user = await this.createUserService.execute(
      createUserDto,
      requesterId,
      requesterRole,
    );
    return { message: 'User created successfully', data: user };
  }

  @Get()
  @Permissions(Permission.USER_READ)
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.EMPLOYEE)
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
    return this.getUsersService.execute(query, requesterRole);
  }

  @Get(':id')
  @Permissions(Permission.USER_READ)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async findOne(
    @Param('id') userId: string,
    @CurrentUser('role') requesterRole: Role,
  ) {
    const user = await this.getUserService.execute(userId, requesterRole);
    return { data: user };
  }

  @Patch(':id')
  @Permissions(Permission.USER_UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user information' })
  async update(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('id') requesterId: string,
    @CurrentUser('role') requesterRole: Role,
  ) {
    const user = await this.updateUserService.execute(
      userId,
      requesterId,
      requesterRole,
      updateUserDto,
    );
    return { message: 'User updated successfully', data: user };
  }

  @Patch(':id/status')
  @Permissions(Permission.USER_UPDATE)
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user status' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async updateStatus(
    @Param('id') userId: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
    @CurrentUser('id') requesterId: string,
  ) {
    const user = await this.updateUserStatusService.execute(
      userId,
      requesterId,
      updateUserStatusDto,
    );
    return { message: 'User status updated successfully', data: user };
  }

  @Patch(':id/restore')
  @Permissions(Permission.USER_UPDATE)
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore deleted user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async restore(@Param('id') userId: string) {
    const user = await this.restoreUserService.execute(userId);
    return { message: 'User restored successfully', data: user };
  }

  @Delete(':id')
  @Permissions(Permission.USER_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async remove(
    @Param('id') userId: string,
    @CurrentUser('id') requesterId: string,
    @CurrentUser('role') requesterRole: Role,
  ): Promise<void> {
    await this.deleteUserService.execute(userId, requesterId, requesterRole);
  }
}

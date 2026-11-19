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
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Permissions } from '../../../common/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { UserJwtAuthGuard } from '../../../common/guards/user-jwt-auth.guard.js';
import { Permission } from '../../../infrastructure/database/generated/prisma/enums.js';

import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

// DTOs
import { CreateCustomerDto } from '../dto/requests/create-customer.dto.js';
import { UpdateCustomerDto } from '../dto/requests/update-customer.dto.js';
import { CustomerQueryDto } from '../dto/requests/customer-query.dto.js';

import { CustomerResponseDto } from '../dto/responses/customer-response.dto.js';

// Services
import { CreateCustomerService } from '../services/create-customer.service.js';
import { GetCustomersService } from '../services/get-customers.service.js';
import { GetCustomerService } from '../services/get-customer.service.js';
import { UpdateCustomerService } from '../services/update-customer.service.js';
import { DeleteCustomerService } from '../services/delete-customer.service.js';
import { RestoreCustomerService } from '../services/restore-customer.service.js';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class CustomerController {
  constructor(
    private readonly createCustomerService: CreateCustomerService,
    private readonly getCustomersService: GetCustomersService,
    private readonly getCustomerService: GetCustomerService,
    private readonly updateCustomerService: UpdateCustomerService,
    private readonly deleteCustomerService: DeleteCustomerService,
    private readonly restoreCustomerService: RestoreCustomerService,
  ) {}

  /**
   * Create customer
   */
  @Post()
  @Permissions(Permission.CUSTOMER_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new customer',
  })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
    @CurrentUser('id') userId: string,
  ) {
    const customer = await this.createCustomerService.execute(
      createCustomerDto,
      userId,
    );

    return {
      message: 'Customer created successfully',
      data: customer,
    };
  }

  /**
   * Get all customers
   */
  @Get()
  @Permissions(Permission.CUSTOMER_READ)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of customers',
    type: [CustomerResponseDto],
  })
  async findAll(@Query() query: CustomerQueryDto) {
    return this.getCustomersService.execute(query);
  }

  /**
   * Get customer by ID
   */
  @Get(':id')
  @Permissions(Permission.CUSTOMER_READ)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer details',
    type: CustomerResponseDto,
  })
  @ApiOperation({
    summary: 'Get customer by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
  })
  async findOne(@Param('id') customerId: string) {
    const customer = await this.getCustomerService.execute(customerId);

    return {
      data: customer,
    };
  }

  /**
   * Update customer
   */
  @Patch(':id')
  @Permissions(Permission.CUSTOMER_UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Updated customer details',
    type: CustomerResponseDto,
  })
  @ApiOperation({
    summary: 'Update customer',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
  })
  async update(
    @Param('id') customerId: string,
    @Body()
    updateCustomerDto: UpdateCustomerDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.updateCustomerService.execute(
      customerId,
      updateCustomerDto,
      userId,
    );
  }

  /**
   * Restore customer
   */
  @Patch(':id/restore')
  @Permissions(Permission.CUSTOMER_UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore deleted customer',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer restored successfully',
    type: CustomerResponseDto,
  })
  async restore(
    @Param('id') customerId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.restoreCustomerService.execute(customerId, userId);

    return {
      message: 'Customer restored successfully',
    };
  }

  /**
   * Delete customer
   */
  @Delete(':id')
  @Permissions(Permission.CUSTOMER_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete customer',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
  })
  async remove(
    @Param('id') customerId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.deleteCustomerService.execute(customerId, userId);
  }
}

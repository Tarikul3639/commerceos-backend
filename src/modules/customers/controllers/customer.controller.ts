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

import { CreateCustomerDto } from '../dto/requests/create-customer.dto';
import { UpdateCustomerDto } from '../dto/requests/update-customer.dto';
import { CustomerQueryDto } from '../dto/requests/customer-query.dto';

// Services

import { CreateCustomerService } from '../services/create-customer.service';
import { GetCustomersService } from '../services/get-customers.service';
import { GetCustomerService } from '../services/get-customer.service';
import { UpdateCustomerService } from '../services/update-customer.service';
import { DeleteCustomerService } from '../services/delete-customer.service';

@ApiTags('Customers')
@Controller('customers')
export class CustomerController {
    constructor(
        private readonly createCustomerService: CreateCustomerService,
        private readonly getCustomersService: GetCustomersService,
        private readonly getCustomerService: GetCustomerService,
        private readonly updateCustomerService: UpdateCustomerService,
        private readonly deleteCustomerService: DeleteCustomerService,
    ) {}

    /**
     * Create customer
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new customer',
    })
    async create(
        @Body() createCustomerDto: CreateCustomerDto,
    ) {
        const customer =
            await this.createCustomerService.execute(
                createCustomerDto,
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
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get all customers',
    })
    async findAll(
        @Query() query: CustomerQueryDto,
    ) {
        return this.getCustomersService.execute(query);
    }

    /**
     * Get customer by ID
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get customer by ID',
    })
    @ApiParam({
        name: 'id',
        description: 'Customer ID',
    })
    async findOne(
        @Param('id') customerId: string,
    ) {
        const customer =
            await this.getCustomerService.execute(
                customerId,
            );

        return {
            data: customer,
        };
    }

    /**
     * Update customer
     */
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
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
    ) {
        const customer =
            await this.updateCustomerService.execute(
                customerId,
                updateCustomerDto,
            );

        return {
            message: 'Customer updated successfully',
            data: customer,
        };
    }

    /**
     * Delete customer
     */
    @Delete(':id')
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
    ): Promise<void> {
        await this.deleteCustomerService.execute(
            customerId,
        );
    }
}
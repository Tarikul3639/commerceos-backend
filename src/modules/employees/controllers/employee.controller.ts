import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import { CreateEmployeeDto } from '../dto/requests/create-employee.dto';
import { EmployeeQueryDto } from '../dto/requests/employee-query.dto';
import { UpdateEmployeeDto } from '../dto/requests/update-employee.dto';

import { CreateEmployeeService } from '../services/create-employee.service';
import { DeleteEmployeeService } from '../services/delete-employee.service';
import { GetEmployeeService } from '../services/get-employee.service';
import { GetEmployeesService } from '../services/get-employees.service';
import { UpdateEmployeeService } from '../services/update-employee.service';

@ApiTags('Employees')
@ApiBearerAuth()
@Controller('employees')
export class EmployeeController {
    constructor(
        private readonly createEmployeeService: CreateEmployeeService,
        private readonly getEmployeeService: GetEmployeeService,
        private readonly getEmployeesService: GetEmployeesService,
        private readonly updateEmployeeService: UpdateEmployeeService,
        private readonly deleteEmployeeService: DeleteEmployeeService,
    ) {}

    @Post()
    @ApiOperation({
        summary: 'Create employee',
    })
    create(
        @Body() dto: CreateEmployeeDto,
    ) {
        return this.createEmployeeService.execute(
            dto,
        );
    }

    @Get()
    @ApiOperation({
        summary: 'Get all employees',
    })
    findAll(
        @Query() query: EmployeeQueryDto,
    ) {
        return this.getEmployeesService.execute(
            query,
        );
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get employee by ID',
    })
    findOne(
        @Param('id') id: string,
    ) {
        return this.getEmployeeService.execute(
            id,
        );
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update employee',
    })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateEmployeeDto,
    ) {
        return this.updateEmployeeService.execute(
            id,
            dto,
        );
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Delete employee',
    })
    remove(
        @Param('id') id: string,
    ) {
        return this.deleteEmployeeService.execute(
            id,
        );
    }
}
import { Module } from '@nestjs/common';

import { EmployeeController } from './controllers/employee.controller';

import { CreateEmployeeService } from './services/create-employee.service';
import { DeleteEmployeeService } from './services/delete-employee.service';
import { GetEmployeeService } from './services/get-employee.service';
import { GetEmployeesService } from './services/get-employees.service';
import { UpdateEmployeeService } from './services/update-employee.service';

@Module({
    controllers: [
        EmployeeController,
    ],
    providers: [
        CreateEmployeeService,
        GetEmployeeService,
        GetEmployeesService,
        UpdateEmployeeService,
        DeleteEmployeeService,
    ],
    exports: [
        CreateEmployeeService,
        GetEmployeeService,
        GetEmployeesService,
        UpdateEmployeeService,
        DeleteEmployeeService,
    ],
})
export class EmployeeModule {}
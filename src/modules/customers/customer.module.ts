import { Module } from '@nestjs/common';

// Controller
import { CustomerController } from './controllers/customer.controller';

// Services
import { CreateCustomerService } from './services/create-customer.service';
import { GetCustomersService } from './services/get-customers.service';
import { GetCustomerService } from './services/get-customer.service';
import { UpdateCustomerService } from './services/update-customer.service';
import { DeleteCustomerService } from './services/delete-customer.service';
import { RestoreCustomerService } from './services/restore-customer.service';

@Module({
    controllers: [
        CustomerController,
    ],

    providers: [
        CreateCustomerService,
        GetCustomersService,
        GetCustomerService,
        UpdateCustomerService,
        DeleteCustomerService,
        RestoreCustomerService,
    ],

    exports: [
        CreateCustomerService,
        GetCustomersService,
        GetCustomerService,
        UpdateCustomerService,
        DeleteCustomerService,
        RestoreCustomerService,
    ],
})
export class CustomerModule {}
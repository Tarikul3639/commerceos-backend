import { Module } from '@nestjs/common';

// Controller
import { CustomerController } from './controllers/customer.controller.js';

// Services
import { CreateCustomerService } from './services/create-customer.service.js';
import { GetCustomersService } from './services/get-customers.service.js';
import { GetCustomerService } from './services/get-customer.service.js';
import { UpdateCustomerService } from './services/update-customer.service.js';
import { DeleteCustomerService } from './services/delete-customer.service.js';
import { RestoreCustomerService } from './services/restore-customer.service.js';

@Module({
  controllers: [CustomerController],

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

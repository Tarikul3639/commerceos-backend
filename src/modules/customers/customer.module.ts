import { Module } from '@nestjs/common';

// Controller
import { CustomerController } from '@/modules/customers/controllers/customer.controller';

// Services
import { CreateCustomerService } from '@/modules/customers/services/create-customer.service';
import { GetCustomersService } from '@/modules/customers/services/get-customers.service';
import { GetCustomerService } from '@/modules/customers/services/get-customer.service';
import { UpdateCustomerService } from '@/modules/customers/services/update-customer.service';
import { DeleteCustomerService } from '@/modules/customers/services/delete-customer.service';
import { RestoreCustomerService } from '@/modules/customers/services/restore-customer.service';

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

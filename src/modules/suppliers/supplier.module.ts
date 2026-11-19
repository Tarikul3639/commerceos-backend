import { Module } from '@nestjs/common';

import { SupplierController } from './controllers/supplier.controller.js';

import { CreateSupplierService } from './services/create-supplier.service.js';
import { DeleteSupplierService } from './services/delete-supplier.service.js';
import { GetSupplierService } from './services/get-supplier.service.js';
import { GetSuppliersService } from './services/get-suppliers.service.js';
import { UpdateSupplierService } from './services/update-supplier.service.js';

@Module({
  controllers: [SupplierController],

  providers: [
    CreateSupplierService,
    GetSupplierService,
    GetSuppliersService,
    UpdateSupplierService,
    DeleteSupplierService,
  ],
})
export class SupplierModule {}

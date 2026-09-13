import { Module } from '@nestjs/common';

import { SupplierController } from './controllers/supplier.controller';

import { CreateSupplierService } from './services/create-supplier.service';
import { DeleteSupplierService } from './services/delete-supplier.service';
import { GetSupplierService } from './services/get-supplier.service';
import { GetSuppliersService } from './services/get-suppliers.service';
import { UpdateSupplierService } from './services/update-supplier.service';

@Module({
    controllers: [
        SupplierController,
    ],

    providers: [
        CreateSupplierService,
        GetSupplierService,
        GetSuppliersService,
        UpdateSupplierService,
        DeleteSupplierService,
    ],
})
export class SupplierModule {}
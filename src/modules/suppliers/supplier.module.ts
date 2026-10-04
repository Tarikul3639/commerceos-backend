import { Module } from '@nestjs/common';

import { SupplierController } from '@/modules/suppliers/controllers/supplier.controller';

import { CreateSupplierService } from '@/modules/suppliers/services/create-supplier.service';
import { DeleteSupplierService } from '@/modules/suppliers/services/delete-supplier.service';
import { GetSupplierService } from '@/modules/suppliers/services/get-supplier.service';
import { GetSuppliersService } from '@/modules/suppliers/services/get-suppliers.service';
import { UpdateSupplierService } from '@/modules/suppliers/services/update-supplier.service';

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

import { Module } from '@nestjs/common';

import { WarehouseController } from './controllers/warehouse.controller';

// Services
import { CreateWarehouseService } from './services/create-warehouse.service';
import { GetWarehouseService } from './services/get-warehouse.service';
import { GetWarehousesService } from './services/get-warehouses.service';
import { UpdateWarehouseService } from './services/update-warehouse.service';
import { DeleteWarehouseService } from './services/delete-warehouse.service';

@Module({
    controllers: [
        WarehouseController,
    ],

    providers: [
        CreateWarehouseService,
        GetWarehouseService,
        GetWarehousesService,
        UpdateWarehouseService,
        DeleteWarehouseService,
    ],

    exports: [
        GetWarehouseService,
    ],
})
export class WarehouseModule {}
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

import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

// DTOs
import { CreateWarehouseDto } from '../dto/requests/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/requests/update-warehouse.dto';
import { WarehouseQueryDto } from '../dto/requests/warehouse-query.dto';

// Services
import { CreateWarehouseService } from '../services/create-warehouse.service';
import { GetWarehouseService } from '../services/get-warehouse.service';
import { GetWarehousesService } from '../services/get-warehouses.service';
import { UpdateWarehouseService } from '../services/update-warehouse.service';
import { DeleteWarehouseService } from '../services/delete-warehouse.service';

@ApiTags('Warehouses')
@Controller('warehouses')
export class WarehouseController {
    constructor(
        private readonly createWarehouseService: CreateWarehouseService,
        private readonly getWarehouseService: GetWarehouseService,
        private readonly getWarehousesService: GetWarehousesService,
        private readonly updateWarehouseService: UpdateWarehouseService,
        private readonly deleteWarehouseService: DeleteWarehouseService,
    ) { }

    /**
     * Create warehouse
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new warehouse',
    })
    async create(
        @Body()
        createWarehouseDto: CreateWarehouseDto,
    ) {
        const warehouse =
            await this.createWarehouseService.execute(createWarehouseDto);

        return {
            message: 'Warehouse created successfully',
            data: warehouse,
        };
    }

    /**
     * Get all warehouses
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get all warehouses',
    })
    async findAll(
        @Query()
        query: WarehouseQueryDto,
    ) {
        return this.getWarehousesService.execute(query);
    }

    /**
     * Get warehouse by ID
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get warehouse by ID',
    })
    @ApiParam({
        name: 'id',
        description: 'Warehouse ID',
    })
    async findOne(
        @Param('id')
        warehouseId: string,
    ) {
        const warehouse = await this.getWarehouseService.execute(warehouseId);

        return {
            data: warehouse,
        };
    }

    /**
     * Update warehouse
     */
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update warehouse',
    })
    @ApiParam({
        name: 'id',
        description: 'Warehouse ID',
    })
    async update(
        @Param('id')
        warehouseId: string,

        @Body()
        updateWarehouseDto: UpdateWarehouseDto,
    ) {
        const warehouse = await this.updateWarehouseService.execute(
            warehouseId,
            updateWarehouseDto,
        );

        return {
            message: 'Warehouse updated successfully',
            data: warehouse,
        };
    }

    /**
     * Delete warehouse
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete warehouse',
    })
    @ApiParam({
        name: 'id',
        description: 'Warehouse ID',
    })
    async remove(
        @Param('id')
        warehouseId: string,
    ): Promise<void> {
        await this.deleteWarehouseService.execute(warehouseId);
    }
}

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
  UseGuards,
} from '@nestjs/common';

import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Permissions } from '../../../common/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { UserJwtAuthGuard } from '../../../common/guards/user-jwt-auth.guard.js';
import { Permission } from '../../../lib/prisma/enums.js';

import { CreateSupplierDto } from '../dto/requests/create-supplier.dto.js';
import { SupplierQueryDto } from '../dto/requests/supplier-query.dto.js';
import { UpdateSupplierDto } from '../dto/requests/update-supplier.dto.js';

import { SupplierResponseDto } from '../dto/responses/supplier-response.dto.js';

import { CreateSupplierService } from '../services/create-supplier.service.js';
import { DeleteSupplierService } from '../services/delete-supplier.service.js';
import { GetSupplierService } from '../services/get-supplier.service.js';
import { GetSuppliersService } from '../services/get-suppliers.service.js';
import { UpdateSupplierService } from '../services/update-supplier.service.js';

@ApiTags('Suppliers')
@Controller('suppliers')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class SupplierController {
  constructor(
    private readonly createSupplierService: CreateSupplierService,
    private readonly getSupplierService: GetSupplierService,
    private readonly getSuppliersService: GetSuppliersService,
    private readonly updateSupplierService: UpdateSupplierService,
    private readonly deleteSupplierService: DeleteSupplierService,
  ) {}

  @Post()
  @Permissions(Permission.SUPPLIER_CREATE)
  @ApiOperation({
    summary: 'Create a new supplier',
  })
  @ApiCreatedResponse({
    type: SupplierResponseDto,
  })
  async create(
    @Body() createSupplierDto: CreateSupplierDto,
    @CurrentUser('id') userId: string,
  ): Promise<SupplierResponseDto> {
    return this.createSupplierService.execute(createSupplierDto, userId);
  }

  @Get()
  @Permissions(Permission.SUPPLIER_READ)
  @ApiOperation({
    summary: 'Get all suppliers',
  })
  @ApiOkResponse({
    description: 'Suppliers retrieved successfully',
  })
  async findAll(@Query() query: SupplierQueryDto) {
    return this.getSuppliersService.execute(query);
  }

  @Get(':id')
  @Permissions(Permission.SUPPLIER_READ)
  @ApiOperation({
    summary: 'Get supplier by ID',
  })
  @ApiParam({
    name: 'id',
    example: 'cm123456789',
  })
  @ApiOkResponse({
    type: SupplierResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<SupplierResponseDto> {
    return this.getSupplierService.execute(id);
  }

  @Patch(':id')
  @Permissions(Permission.SUPPLIER_UPDATE)
  @ApiOperation({
    summary: 'Update supplier',
  })
  @ApiParam({
    name: 'id',
    example: 'cm123456789',
  })
  @ApiOkResponse({
    type: SupplierResponseDto,
  })
  async update(
    @Param('id') id: string,

    @Body() updateSupplierDto: UpdateSupplierDto,
    @CurrentUser('id') userId: string,
  ): Promise<SupplierResponseDto> {
    return this.updateSupplierService.execute(id, updateSupplierDto, userId);
  }

  @Delete(':id')
  @Permissions(Permission.SUPPLIER_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete supplier',
  })
  @ApiParam({
    name: 'id',
    example: 'cm123456789',
  })
  @ApiNoContentResponse({
    description: 'Supplier deleted successfully',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.deleteSupplierService.execute(id, userId);
  }
}

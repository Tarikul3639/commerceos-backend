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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CreatePurchaseDto } from './dto/requests/create-purchase.dto.js';
import { UpdatePurchaseDto } from './dto/requests/update-purchase.dto.js';
import { PurchaseQueryDto } from './dto/requests/purchase-query.dto.js';
import { ReceivePurchaseDto } from './dto/requests/receive-purchase.dto.js';
import { CancelPurchaseDto } from './dto/requests/cancel-purchase.dto.js';

import { PurchaseResponseDto } from './dto/responses/purchase-response.dto.js';

import { CreatePurchaseService } from './services/create-purchase.service.js';
import { GetPurchaseService } from './services/get-purchase.service.js';
import { GetPurchasesService } from './services/get-purchases.service.js';
import { UpdatePurchaseService } from './services/update-purchase.service.js';
import { ReceivePurchaseService } from './services/receive-purchase.service.js';
import { CancelPurchaseService } from './services/cancel-purchase.service.js';
import { DeletePurchaseService } from './services/delete-purchase.service.js';

import { UserJwtAuthGuard } from '../../common/guards/user-jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { Permission } from '../../infrastructure/database/generated/prisma/enums.js';

@ApiTags('Purchases')
@ApiBearerAuth()
@Controller('purchases')
export class PurchaseController {
  constructor(
    private readonly createPurchaseService: CreatePurchaseService,
    private readonly getPurchaseService: GetPurchaseService,
    private readonly getPurchasesService: GetPurchasesService,
    private readonly updatePurchaseService: UpdatePurchaseService,
    private readonly receivePurchaseService: ReceivePurchaseService,
    private readonly cancelPurchaseService: CancelPurchaseService,
    private readonly deletePurchaseService: DeletePurchaseService,
  ) {}

  @Post()
  @UseGuards(UserJwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions(Permission.PURCHASE_CREATE)
  @ApiOperation({
    summary: 'Create a new purchase',
  })
  @ApiResponse({
    status: 201,
    type: PurchaseResponseDto,
  })
  async create(
    @Body() createPurchaseDto: CreatePurchaseDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.createPurchaseService.execute(userId, createPurchaseDto);
  }

  @Get()
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.PURCHASE_READ)
  @ApiOperation({
    summary: 'Get all purchases',
  })
  async findAll(@Query() query: PurchaseQueryDto) {
    return this.getPurchasesService.execute(query);
  }

  @Get(':id')
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.PURCHASE_READ)
  @ApiOperation({
    summary: 'Get purchase by ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: PurchaseResponseDto,
  })
  async findOne(@Param('id') id: string) {
    return this.getPurchaseService.execute(id);
  }

  @Put(':id')
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.PURCHASE_UPDATE)
  @ApiOperation({
    summary: 'Update a pending purchase',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: PurchaseResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.updatePurchaseService.execute(id, updatePurchaseDto, userId);
  }

  @Patch(':id/receive')
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.PURCHASE_UPDATE)
  @ApiOperation({
    summary: 'Receive a purchase and add stock',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  async receive(
    @Param('id') id: string,
    @Body() receivePurchaseDto: ReceivePurchaseDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.receivePurchaseService.execute(id, userId, receivePurchaseDto);
  }

  @Patch(':id/cancel')
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.PURCHASE_UPDATE)
  @ApiOperation({
    summary: 'Cancel a pending purchase',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  async cancel(
    @Param('id') id: string,

    @Body() cancelPurchaseDto: CancelPurchaseDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.cancelPurchaseService.execute(id, cancelPurchaseDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.PURCHASE_DELETE)
  @ApiOperation({
    summary: 'Delete a pending purchase without returns',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204, description: 'Purchase deleted' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.deletePurchaseService.execute(id, userId);
  }
}

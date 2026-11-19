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
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { UserJwtAuthGuard } from '../../common/guards/user-jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Permission } from '../../lib/prisma/enums.js';

import { CreatePurchaseReturnDto } from './dto/requests/create-purchase-return.dto.js';
import { PurchaseReturnQueryDto } from './dto/requests/purchase-return-query.dto.js';

import { PurchaseReturnResponseDto } from './dto/responses/purchase-return-response.dto.js';

import { CreatePurchaseReturnService } from './services/create-purchase-return.service.js';
import { GetPurchaseReturnService } from './services/get-purchase-return.service.js';
import { GetPurchaseReturnsService } from './services/get-purchase-returns.service.js';
import { PurchaseReturnActionsService } from './services/purchase-return-actions.service.js';

@ApiTags('Purchase Returns')
@ApiBearerAuth()
@Controller('purchase-returns')
export class PurchaseReturnController {
  constructor(
    private readonly createPurchaseReturnService: CreatePurchaseReturnService,
    private readonly getPurchaseReturnService: GetPurchaseReturnService,
    private readonly getPurchaseReturnsService: GetPurchaseReturnsService,
    private readonly purchaseReturnActionsService: PurchaseReturnActionsService,
  ) {}

  @Post()
  @UseGuards(UserJwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions(Permission.PURCHASE_CREATE)
  @ApiOperation({
    summary: 'Create a purchase return',
  })
  @ApiResponse({
    status: 201,
    type: PurchaseReturnResponseDto,
  })
  async create(
    @Body() createPurchaseReturnDto: CreatePurchaseReturnDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.createPurchaseReturnService.execute(
      userId,
      createPurchaseReturnDto,
    );
  }

  @Get()
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.PURCHASE_READ)
  @ApiOperation({
    summary: 'Get all purchase returns',
  })
  async findAll(@Query() query: PurchaseReturnQueryDto) {
    return this.getPurchaseReturnsService.execute(query);
  }

  @Get(':id')
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.PURCHASE_READ)
  @ApiOperation({
    summary: 'Get purchase return by ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: PurchaseReturnResponseDto,
  })
  async findOne(@Param('id') id: string) {
    return this.getPurchaseReturnService.execute(id);
  }

  @Patch(':id/approve')
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.PURCHASE_UPDATE)
  @ApiOperation({ summary: 'Approve a pending purchase return' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Purchase return approved' })
  async approve(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.purchaseReturnActionsService.approve(id, userId);
  }

  @Patch(':id/reject')
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.PURCHASE_UPDATE)
  @ApiOperation({ summary: 'Reject a pending purchase return' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Purchase return rejected' })
  async reject(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.purchaseReturnActionsService.reject(id, userId);
  }

  @Patch(':id/complete')
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.PURCHASE_UPDATE)
  @ApiOperation({ summary: 'Complete an approved purchase return' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Purchase return completed' })
  async complete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.purchaseReturnActionsService.complete(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.PURCHASE_RETURN_DELETE)
  @ApiOperation({ summary: 'Delete a pending or rejected purchase return' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204, description: 'Purchase return deleted' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.purchaseReturnActionsService.delete(id, userId);
  }
}

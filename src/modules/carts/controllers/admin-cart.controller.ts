import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Permissions } from '../../../common/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { UserJwtAuthGuard } from '../../../common/guards/user-jwt-auth.guard.js';
import { Permission } from '../../../lib/prisma/enums.js';

import { AdminCartQueryDto } from '../dto/requests/admin-cart-query.dto.js';
import { AdminCartsPaginatedResponseDto } from '../dto/responses/admin-cart-response.dto.js';
import { GetAdminCartsService } from '../services/get-admin-carts.service.js';

@ApiTags('Admin Carts')
@ApiBearerAuth()
@Controller('admin/carts')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class AdminCartController {
  constructor(private readonly getAdminCartsService: GetAdminCartsService) {}

  @Get()
  @Permissions(Permission.CART_READ)
  @ApiOperation({
    summary: 'List active customer carts for the Admin dashboard',
  })
  async findAll(
    @Query() query: AdminCartQueryDto,
  ): Promise<AdminCartsPaginatedResponseDto> {
    return this.getAdminCartsService.execute(query);
  }
}

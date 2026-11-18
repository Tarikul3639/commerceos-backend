import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { Permission } from '@/lib/prisma/enums';

import { AdminCartQueryDto } from '../dto/requests/admin-cart-query.dto';
import { AdminCartsPaginatedResponseDto } from '../dto/responses/admin-cart-response.dto';
import { GetAdminCartsService } from '../services/get-admin-carts.service';

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

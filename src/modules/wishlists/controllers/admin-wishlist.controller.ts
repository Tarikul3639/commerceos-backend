import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../../common/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { UserJwtAuthGuard } from '../../../common/guards/user-jwt-auth.guard.js';
import { Permission } from '../../../infrastructure/database/generated/prisma/enums.js';
import { AdminWishlistQueryDto } from '../dto/requests/admin-wishlist-query.dto.js';
import { AdminWishlistsPaginatedResponseDto } from '../dto/responses/wishlist-response.dto.js';
import { GetAdminWishlistsService } from '../services/get-admin-wishlists.service.js';

@ApiTags('Admin Wishlists')
@ApiBearerAuth()
@Controller('admin/wishlists')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class AdminWishlistController {
  constructor(
    private readonly getAdminWishlistsService: GetAdminWishlistsService,
  ) {}

  @Get()
  @Permissions(Permission.WISHLIST_READ)
  @ApiOperation({ summary: 'List customer wishlists for Admin review' })
  findAll(
    @Query() query: AdminWishlistQueryDto,
  ): Promise<AdminWishlistsPaginatedResponseDto> {
    return this.getAdminWishlistsService.execute(query);
  }
}

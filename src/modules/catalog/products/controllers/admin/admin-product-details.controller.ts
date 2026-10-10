import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { Permission } from '@/lib/prisma/enums';

import { ProductDetailResponseDto } from '../../dto/responses/product-detail-response.dto';
import { GetAdminProductDetailsService } from '../../services/admin/get-admin-product-details.service';

@ApiTags('Admin Products')
@Controller('admin/products')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class AdminProductDetailsController {
  constructor(
    private readonly getAdminProductDetailsService: GetAdminProductDetailsService,
  ) { }

  @Get(':id/details')
  @Permissions(Permission.PRODUCT_READ)
  @ApiOperation({ summary: 'Get product details' })
  @ApiResponse({ status: 200, type: ProductDetailResponseDto })
  async details(@Param('id') id: string): Promise<ProductDetailResponseDto> {
    return this.getAdminProductDetailsService.execute(id);
  }
}

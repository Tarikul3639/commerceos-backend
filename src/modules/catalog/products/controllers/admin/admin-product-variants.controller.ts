import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { Permission } from '@/lib/prisma/enums';

import { CreateProductVariantDto } from '../../dto/requests/variants/create-product-variant.dto';
import { UpdateProductVariantDto } from '../../dto/requests/variants/update-product-variant.dto';
import { CreateProductVariantService } from '../../services/variants/create-product-variant.service';
import { UpdateProductVariantService } from '../../services/variants/update-product-variant.service';
import { DeleteProductVariantService } from '../../services/variants/delete-product-variant.service';

@ApiTags('Admin Product Variants')
@Controller('admin/products')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class AdminProductVariantsController {
  constructor(
    private readonly createProductVariantService: CreateProductVariantService,
    private readonly updateProductVariantService: UpdateProductVariantService,
    private readonly deleteProductVariantService: DeleteProductVariantService,
  ) {}

  @Post(':id/variants')
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Create product variant' })
  async createVariant(
    @Param('id') productId: string,
    @Body() dto: CreateProductVariantDto,
  ): Promise<void> {
    await this.createProductVariantService.execute(productId, dto);
  }

  @Patch(':id/variants/:variantId')
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Update product variant' })
  async updateVariant(
    @Param('id') productId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateProductVariantDto,
  ): Promise<void> {
    await this.updateProductVariantService.execute(productId, variantId, dto);
  }

  @Delete(':id/variants/:variantId')
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Delete product variant' })
  async deleteVariant(
    @Param('id') productId: string,
    @Param('variantId') variantId: string,
  ): Promise<void> {
    await this.deleteProductVariantService.execute(productId, variantId);
  }
}

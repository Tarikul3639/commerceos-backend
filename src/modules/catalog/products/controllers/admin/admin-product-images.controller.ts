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

import { AddProductImageDto } from '../../dto/requests/images/add-product-image.dto';
import { UpdateProductImageDto } from '../../dto/requests/images/update-product-image.dto';
import { AddProductImageService } from '../../services/images/add-product-image.service';
import { UpdateProductImageService } from '../../services/images/update-product-image.service';
import { DeleteProductImageService } from '../../services/images/delete-product-image.service';

@ApiTags('Admin Product Images')
@Controller('admin/products')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class AdminProductImagesController {
  constructor(
    private readonly addProductImageService: AddProductImageService,
    private readonly updateProductImageService: UpdateProductImageService,
    private readonly deleteProductImageService: DeleteProductImageService,
  ) {}

  @Post(':id/images')
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Add product image' })
  async createImage(
    @Param('id') productId: string,
    @Body() dto: AddProductImageDto,
  ): Promise<void> {
    await this.addProductImageService.execute(productId, dto);
  }

  @Patch(':id/images/:imageId')
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Update product image' })
  async updateImage(
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
    @Body() dto: UpdateProductImageDto,
  ): Promise<void> {
    await this.updateProductImageService.execute(productId, imageId, dto);
  }

  @Delete(':id/images/:imageId')
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Delete product image' })
  async deleteImage(
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
  ): Promise<void> {
    await this.deleteProductImageService.execute(productId, imageId);
  }
}

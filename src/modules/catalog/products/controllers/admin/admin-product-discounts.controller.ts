import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { Permission } from '@/lib/prisma/enums';

import { SetProductDiscountDto } from '../../dto/requests/discounts/set-product-discount.dto';
import { ProductDiscountResponseDto } from '../../dto/responses/product-discount-response.dto';
import { SetProductDiscountService } from '../../services/discounts/set-product-discount.service';
import { GetProductDiscountService } from '../../services/discounts/get-product-discount.service';
import { RemoveProductDiscountService } from '../../services/discounts/remove-product-discount.service';

@ApiTags('Admin Product Discounts')
@Controller('admin/products')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class AdminProductDiscountsController {
  constructor(
    private readonly setProductDiscountService: SetProductDiscountService,
    private readonly getProductDiscountService: GetProductDiscountService,
    private readonly removeProductDiscountService: RemoveProductDiscountService,
  ) {}

  @Get(':id/discount')
  @Permissions(Permission.PRODUCT_READ)
  @ApiOperation({ summary: 'Get product discount' })
  async getDiscount(
    @Param('id') productId: string,
  ): Promise<ProductDiscountResponseDto | null> {
    return this.getProductDiscountService.execute(productId);
  }

  @Post(':id/discount')
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Set product discount' })
  async setDiscount(
    @Param('id') productId: string,
    @Body() dto: SetProductDiscountDto,
  ): Promise<ProductDiscountResponseDto> {
    return this.setProductDiscountService.execute(productId, dto);
  }

  @Delete(':id/discount')
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Remove product discount' })
  async removeDiscount(@Param('id') productId: string): Promise<void> {
    await this.removeProductDiscountService.execute(productId);
  }
}

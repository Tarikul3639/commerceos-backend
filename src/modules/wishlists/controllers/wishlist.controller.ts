import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentCustomer } from '../../../common/decorators/current-customer.decorator.js';
import { CustomerJwtAuthGuard } from '../../../common/guards/customer-jwt-auth.guard.js';
import { AddWishlistItemDto } from '../dto/requests/add-wishlist-item.dto.js';
import { WishlistResponseDto } from '../dto/responses/wishlist-response.dto.js';
import { AddWishlistItemService } from '../services/add-wishlist-item.service.js';
import { ClearWishlistService } from '../services/clear-wishlist.service.js';
import { GetWishlistService } from '../services/get-wishlist.service.js';
import { RemoveWishlistItemService } from '../services/remove-wishlist-item.service.js';

@ApiTags('Wishlist')
@ApiBearerAuth()
@Controller('wishlist')
@UseGuards(CustomerJwtAuthGuard)
export class WishlistController {
  constructor(
    private readonly getWishlistService: GetWishlistService,
    private readonly addWishlistItemService: AddWishlistItemService,
    private readonly removeWishlistItemService: RemoveWishlistItemService,
    private readonly clearWishlistService: ClearWishlistService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get the authenticated customer wishlist' })
  getWishlist(
    @CurrentCustomer('id') customerId: string,
  ): Promise<WishlistResponseDto> {
    return this.getWishlistService.execute(customerId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add a published product to the customer wishlist' })
  addItem(
    @CurrentCustomer('id') customerId: string,
    @Body() dto: AddWishlistItemDto,
  ): Promise<WishlistResponseDto> {
    return this.addWishlistItemService.execute(customerId, dto);
  }

  @Delete('items/:productId')
  @ApiParam({ name: 'productId', format: 'uuid' })
  @ApiOperation({ summary: 'Remove a product from the customer wishlist' })
  removeItem(
    @CurrentCustomer('id') customerId: string,
    @Param('productId', new ParseUUIDPipe()) productId: string,
  ): Promise<WishlistResponseDto> {
    return this.removeWishlistItemService.execute(customerId, productId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear the customer wishlist' })
  clear(@CurrentCustomer('id') customerId: string): Promise<void> {
    return this.clearWishlistService.execute(customerId);
  }
}

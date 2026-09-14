import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

import { AddCartItemDto } from '../dto/requests/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/requests/update-cart-item.dto';
import { CartResponseDto } from '../dto/responses/cart-response.dto';

// Services
import { AddCartItemService } from '../services/add-cart-item.service';
import { ClearCartService } from '../services/clear-cart.service';
import { GetCartService } from '../services/get-cart.service';
import { RemoveCartItemService } from '../services/remove-cart-item.service';
import { UpdateCartItemService } from '../services/update-cart-item.service';

import { CurrentCustomer } from '../../../common/decorators/current-customer.decorator';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
    constructor(
        private readonly addCartItemService: AddCartItemService,
        private readonly getCartService: GetCartService,
        private readonly updateCartItemService: UpdateCartItemService,
        private readonly removeCartItemService: RemoveCartItemService,
        private readonly clearCartService: ClearCartService,
    ) { }

    @Post('items')
    @ApiOperation({
        summary: 'Add item to cart',
    })
    async addItem(
        @Body() addCartItemDto: AddCartItemDto,
    ): Promise<CartResponseDto> {
        /*
         * পরে JWT থেকে customerId নিবে
         */
        const customerId = 'CUSTOMER_ID';

        return this.addCartItemService.execute(customerId, addCartItemDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Get current customer cart',
    })
    async getCart(
        @CurrentCustomer('id') customerId: string,
    ): Promise<CartResponseDto> {
        return this.getCartService.execute(customerId);
    }

    @Patch('items/:cartItemId')
    @ApiOperation({
        summary: 'Update cart item quantity',
    })
    @ApiParam({
        name: 'cartItemId',
    })
    async updateItem(
        @Param('cartItemId') cartItemId: string,
        @Body() updateCartItemDto: UpdateCartItemDto,
        @CurrentCustomer('id') customerId: string,
    ): Promise<CartResponseDto> {
        return this.updateCartItemService.execute(
            customerId,
            cartItemId,
            updateCartItemDto,
        );
    }

    @Delete('items/:cartItemId')
    @ApiOperation({
        summary: 'Remove item from cart',
    })
    @ApiParam({
        name: 'cartItemId',
    })
    async removeItem(
        @Param('cartItemId') cartItemId: string,
        @CurrentCustomer('id') customerId: string,
    ): Promise<CartResponseDto> {
        return this.removeCartItemService.execute(customerId, cartItemId);
    }

    @Delete()
    @ApiOperation({
        summary: 'Clear cart',
    })
    async clearCart(@CurrentCustomer('id') customerId: string): Promise<void> {
        return this.clearCartService.execute(customerId);
    }
}

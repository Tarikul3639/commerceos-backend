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

import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

// DTOs
import { CreateDiscountDto } from '../dto/requests/create-discount.dto';
import { UpdateDiscountDto } from '../dto/requests/update-discount.dto';
import { DiscountQueryDto } from '../dto/requests/discount-query.dto';
import { AssignProductDiscountDto } from '../dto/requests/assign-product-discount.dto';

import {
    DiscountResponseDto,
    DiscountResponseWithPaginationDto,
} from '../dto/responses/discount-response.dto';
import { DiscountProductsResponseDto } from '../dto/responses/discount-products-response.dto';

// Services
import { CreateDiscountService } from '../services/create-discount.service';
import { GetDiscountsService } from '../services/get-discounts.service';
import { GetDiscountService } from '../services/get-discount.service';
import { GetDiscountProductsService } from '../services/get-discount-products.service';
import { UpdateDiscountService } from '../services/update-discount.service';
import { DeleteDiscountService } from '../services/delete-discount.service';
import { AssignProductDiscountService } from '../services/assign-product-discount.service';
import { RemoveProductDiscountService } from '../services/remove-product-discount.service';

import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';

@ApiTags('Discounts')
@Controller('discounts')
export class DiscountController {
    constructor(
        private readonly createDiscountService: CreateDiscountService,
        private readonly getDiscountsService: GetDiscountsService,
        private readonly getDiscountService: GetDiscountService,
        private readonly getDiscountProductsService: GetDiscountProductsService,
        private readonly updateDiscountService: UpdateDiscountService,
        private readonly deleteDiscountService: DeleteDiscountService,
        private readonly assignProductDiscountService: AssignProductDiscountService,
        private readonly removeProductDiscountService: RemoveProductDiscountService,
    ) { }

    /**
     * Create discount
     */
    @Post()
    @UseGuards(UserJwtAuthGuard, RolesGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Discount created successfully',
        type: DiscountResponseDto,
    })
    @ApiOperation({
        summary: 'Create a new discount',
    })
    async create(
        @Body() createDiscountDto: CreateDiscountDto,
        @CurrentUser('id') userId: string,
    ) {
        return await this.createDiscountService.execute(userId, createDiscountDto);
    }

    /**
     * Get all discounts
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of discounts',
        type: DiscountResponseWithPaginationDto,
    })
    @ApiOperation({
        summary: 'Get all discounts',
    })
    async findAll(@Query() query: DiscountQueryDto) {
        return await this.getDiscountsService.execute(query);
    }

    /**
     * Get discount by ID
     */
    @Get(':id')
    @UseGuards(UserJwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get discount by ID',
    })
    @ApiParam({
        name: 'id',
        description: 'Discount ID',
    })
    async findOne(@Param('id') discountId: string) {
        return await this.getDiscountService.execute(discountId);
    }

    /**
     * Update discount
     */
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Discount updated successfully',
        type: DiscountResponseDto,
    })
    @ApiOperation({
        summary: 'Update discount by ID',
    })
    @ApiParam({
        name: 'id',
        description: 'Discount ID',
    })
    async update(
        @Param('id') discountId: string,

        @Body()
        updateDiscountDto: UpdateDiscountDto,
    ) {
        return await this.updateDiscountService.execute(
            discountId,
            updateDiscountDto,
        );
    }

    /**
     * Assign discount to products
     */
    @Post(':id/products')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Assign discount to products',
    })
    @ApiParam({
        name: 'id',
        description: 'Discount ID',
    })
    async assignProducts(
        @Param('id') discountId: string,

        @Body()
        assignProductDiscountDto: AssignProductDiscountDto,
    ) {
        return await this.assignProductDiscountService.execute(
            discountId,
            assignProductDiscountDto,
        );
    }

    /**
     * Get products assigned to discount
     */
    @Get(':id/products')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of products assigned to the discount',
        type: DiscountProductsResponseDto,
    })
    @ApiOperation({
        summary: 'Get products assigned to a discount',
    })
    @ApiParam({
        name: 'id',
        description: 'Discount ID',
    })
    async findProducts(
        @Param('id') discountId: string,
        @Query() query: DiscountQueryDto,
    ) {
        return await this.getDiscountProductsService.execute(discountId, query);
    }

    /**
     * Remove discount from a product
     */
    @Delete(':id/products/:productId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Remove discount from a product',
    })
    @ApiParam({
        name: 'id',
        description: 'Discount ID',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product ID',
    })
    async removeProduct(
        @Param('id') discountId: string,

        @Param('productId') productId: string,
    ) {
        return await this.removeProductDiscountService.execute(
            discountId,
            productId,
        );
    }

    /**
     * Delete discount
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete discount',
    })
    @ApiParam({
        name: 'id',
        description: 'Discount ID',
    })
    async remove(@Param('id') discountId: string): Promise<void> {
        await this.deleteDiscountService.execute(discountId);
    }
}

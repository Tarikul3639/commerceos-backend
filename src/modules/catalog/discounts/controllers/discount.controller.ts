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
} from '@nestjs/common';

import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

// DTOs
import { CreateDiscountDto } from '../dto/requests/create-discount.dto';
import { UpdateDiscountDto } from '../dto/requests/update-discount.dto';
import { DiscountQueryDto } from '../dto/requests/discount-query.dto';
import { AssignProductDiscountDto } from '../dto/requests/assign-product-discount.dto';

// Services
import { CreateDiscountService } from '../services/create-discount.service';
import { GetDiscountsService } from '../services/get-discounts.service';
import { GetDiscountService } from '../services/get-discount.service';
import { UpdateDiscountService } from '../services/update-discount.service';
import { DeleteDiscountService } from '../services/delete-discount.service';
import { AssignProductDiscountService } from '../services/assign-product-discount.service';
import { RemoveProductDiscountService } from '../services/remove-product-discount.service';

import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
// import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';

@ApiTags('Discounts')
@Controller('discounts')
export class DiscountController {
    constructor(
        private readonly createDiscountService: CreateDiscountService,
        private readonly getDiscountsService: GetDiscountsService,
        private readonly getDiscountService: GetDiscountService,
        private readonly updateDiscountService: UpdateDiscountService,
        private readonly deleteDiscountService: DeleteDiscountService,
        private readonly assignProductDiscountService: AssignProductDiscountService,
        private readonly removeProductDiscountService: RemoveProductDiscountService,
    ) { }

    /**
     * Create discount
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new discount',
    })
    async create(
        @Body() createDiscountDto: CreateDiscountDto,
        @CurrentUser('id') userId: string,
    ) {
        const discount = await this.createDiscountService.execute(
            userId,
            createDiscountDto,
        );

        return {
            message: 'Discount created successfully',
            data: discount,
        };
    }

    /**
     * Get all discounts
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get all discounts',
    })
    async findAll(@Query() query: DiscountQueryDto) {
        const result = await this.getDiscountsService.execute(query);

        return result;
    }

    /**
     * Get discount by ID
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get discount by ID',
    })
    @ApiParam({
        name: 'id',
        description: 'Discount ID',
    })
    async findOne(@Param('id') discountId: string) {
        const discount = await this.getDiscountService.execute(discountId);

        return {
            data: discount,
        };
    }

    /**
     * Update discount
     */
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update discount',
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
        const discount = await this.updateDiscountService.execute(
            discountId,
            updateDiscountDto,
        );

        return {
            message: 'Discount updated successfully',
            data: discount,
        };
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
        await this.assignProductDiscountService.execute(
            discountId,
            assignProductDiscountDto,
        );

        return {
            message: 'Discount assigned to products successfully',
        };
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
        await this.removeProductDiscountService.execute(discountId, productId);

        return {
            message: 'Discount removed from product successfully',
        };
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

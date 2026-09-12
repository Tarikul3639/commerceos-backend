import {
    Body,
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
} from '@nestjs/common';

import {
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

// DTOs
import { CreateProductVariantDto } from '../dto/requests/create-product-variant.dto';
import { UpdateProductVariantDto } from '../dto/requests/update-product-variant.dto';

// Services
import { CreateProductVariantService } from '../services/create-product-variant.service';
import { UpdateProductVariantService } from '../services/update-product-variant.service';
import { DeleteProductVariantService } from '../services/delete-product-variant.service';

@ApiTags('Product Variants')
@Controller('products/:productId/variants')
export class ProductVariantController {
    constructor(
        private readonly createProductVariantService: CreateProductVariantService,

        private readonly updateProductVariantService: UpdateProductVariantService,

        private readonly deleteProductVariantService: DeleteProductVariantService,
    ) {}

    /**
     * Create product variant
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a product variant',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product ID',
    })
    async create(
        @Param('productId') productId: string,

        @Body() dto: CreateProductVariantDto,
    ) {
        const variant =
            await this.createProductVariantService.execute(
                productId,
                dto,
            );

        return {
            message: 'Product variant created successfully',
            data: variant,
        };
    }

    /**
     * Update product variant
     */
    @Patch(':variantId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update a product variant',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product ID',
    })
    @ApiParam({
        name: 'variantId',
        description: 'Product variant ID',
    })
    async update(
        @Param('productId') productId: string,

        @Param('variantId') variantId: string,

        @Body() dto: UpdateProductVariantDto,
    ) {
        const variant =
            await this.updateProductVariantService.execute(
                productId,
                variantId,
                dto,
            );

        return {
            message: 'Product variant updated successfully',
            data: variant,
        };
    }

    /**
     * Delete product variant
     */
    @Delete(':variantId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete a product variant',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product ID',
    })
    @ApiParam({
        name: 'variantId',
        description: 'Product variant ID',
    })
    async remove(
        @Param('productId') productId: string,

        @Param('variantId') variantId: string,
    ): Promise<void> {
        await this.deleteProductVariantService.execute(
            productId,
            variantId,
        );
    }
}
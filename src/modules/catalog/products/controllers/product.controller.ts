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
import { CreateProductDto } from '../dto/requests/create-product.dto';
import { UpdateProductDto } from '../dto/requests/update-product.dto';
import { ProductQueryDto } from '../dto/requests/product-query.dto';

// Services
import { CreateProductService } from '../services/create-product.service';
import { GetProductsService } from '../services/get-products.service';
import { GetProductService } from '../services/get-product.service';
import { UpdateProductService } from '../services/update-product.service';
import { DeleteProductService } from '../services/delete-product.service';

@ApiTags('Products')
@Controller('products')
export class ProductController {
    constructor(
        private readonly createProductService: CreateProductService,
        private readonly getProductsService: GetProductsService,
        private readonly getProductService: GetProductService,
        private readonly updateProductService: UpdateProductService,
        private readonly deleteProductService: DeleteProductService,
    ) { }

    /**
     * Create product
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new product',
    })
    async create(@Body() dto: CreateProductDto) {
        const product = await this.createProductService.execute(dto);

        return {
            message: 'Product created successfully',
            data: product,
        };
    }

    /**
     * Get all products
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get all products',
    })
    async findAll(@Query() query: ProductQueryDto) {
        const products = await this.getProductsService.execute(query);

        return products;
    }

    /**
     * Get product by ID
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get product by ID',
    })
    @ApiParam({
        name: 'id',
        description: 'Product ID',
    })
    async findOne(@Param('id') productId: string) {
        const product = await this.getProductService.execute(productId);

        return {
            data: product,
        };
    }

    /**
     * Update product
     */
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update product',
    })
    @ApiParam({
        name: 'id',
        description: 'Product ID',
    })
    async update(
        @Param('id') productId: string,

        @Body() dto: UpdateProductDto,
    ) {
        const product = await this.updateProductService.execute(productId, dto);

        return {
            message: 'Product updated successfully',
            data: product,
        };
    }

    /**
     * Delete product
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete product',
    })
    @ApiParam({
        name: 'id',
        description: 'Product ID',
    })
    async remove(@Param('id') productId: string): Promise<void> {
        await this.deleteProductService.execute(productId);
    }
}

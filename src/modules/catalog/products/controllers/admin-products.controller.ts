import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

import { CreateProductDto } from '../dto/requests/create-product.dto';
import { ProductQueryDto } from '../dto/requests/product-query.dto';
import { UpdateProductDto } from '../dto/requests/update-product.dto';

import { AdminProductDetailResponseDto } from '../dto/responses/admin-product-detail-response.dto';
import { AdminProductListResponseDto } from '../dto/responses/admin-product-list-response.dto';

import { CreateProductService } from '../services/admin/create-product.service';
import { DeleteProductService } from '../services/admin/delete-product.service';
import { GetAdminProductDetailsService } from '../services/admin/get-admin-product-details.service';
import { GetAdminProductsService } from '../services/admin/get-admin-products.service';
import { UpdateProductService } from '../services/admin/update-product.service';

@ApiTags('Admin - Products')
@Controller('admin/products')
export class AdminProductsController {
    constructor(
        private readonly createProductService: CreateProductService,
        private readonly getAdminProductsService: GetAdminProductsService,
        private readonly getAdminProductDetailsService: GetAdminProductDetailsService,
        private readonly updateProductService: UpdateProductService,
        private readonly deleteProductService: DeleteProductService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a product' })
    @ApiCreatedResponse({ type: AdminProductDetailResponseDto })
    async create(
        @Body() dto: CreateProductDto,
    ): Promise<AdminProductDetailResponseDto> {
        return this.createProductService.execute(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get paginated admin products' })
    @ApiOkResponse({ type: AdminProductListResponseDto })
    async findAll(
        @Query() query: ProductQueryDto,
    ): Promise<AdminProductListResponseDto> {
        return this.getAdminProductsService.execute(query);
    }

    @Get(':productId/details')
    @ApiOperation({ summary: 'Get admin product details' })
    @ApiParam({
        name: 'productId',
        example: 'cm123product456',
    })
    @ApiOkResponse({ type: AdminProductDetailResponseDto })
    async findOne(
        @Param('productId') productId: string,
    ): Promise<AdminProductDetailResponseDto> {
        return this.getAdminProductDetailsService.execute(productId);
    }

    @Patch(':productId')
    @ApiOperation({ summary: 'Update a product' })
    @ApiParam({
        name: 'productId',
        example: 'cm123product456',
    })
    @ApiOkResponse({ type: AdminProductDetailResponseDto })
    async update(
        @Param('productId') productId: string,
        @Body() dto: UpdateProductDto,
    ): Promise<AdminProductDetailResponseDto> {
        return this.updateProductService.execute(productId, dto);
    }

    @Delete(':productId')
    @ApiOperation({ summary: 'Soft delete a product' })
    @ApiParam({
        name: 'productId',
        example: 'cm123product456',
    })
    @ApiOkResponse({
        schema: {
            example: {
                message: 'Product deleted successfully',
            },
        },
    })
    async remove(
        @Param('productId') productId: string,
    ): Promise<{ message: string }> {
        return this.deleteProductService.execute(productId);
    }
}

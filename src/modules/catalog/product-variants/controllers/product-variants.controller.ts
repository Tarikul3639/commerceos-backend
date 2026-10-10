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
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import { CreateProductVariantDto } from '../dto/requests/create-product-variant.dto';
import { UpdateProductVariantDto } from '../dto/requests/update-product-variant.dto';
import { ProductVariantResponseDto } from '../dto/responses/product-variant-response.dto';

import { CreateProductVariantService } from '../services/create-product-variant.service';
import { DeleteProductVariantService } from '../services/delete-product-variant.service';
import { GetProductVariantsService } from '../services/get-product-variants.service';
import { UpdateProductVariantService } from '../services/update-product-variant.service';

@ApiTags('Product Variants')
@Controller('admin/product-variants')
export class ProductVariantsController {
    constructor(
        private readonly createProductVariantService: CreateProductVariantService,
        private readonly getProductVariantsService: GetProductVariantsService,
        private readonly updateProductVariantService: UpdateProductVariantService,
        private readonly deleteProductVariantService: DeleteProductVariantService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a product variant' })
    @ApiCreatedResponse({ type: ProductVariantResponseDto })
    async create(
        @Body() dto: CreateProductVariantDto,
    ): Promise<ProductVariantResponseDto> {
        return this.createProductVariantService.execute(dto);
    }

    @Get(':productId')
    @ApiOperation({ summary: 'Get all variants for a product' })
    @ApiOkResponse({
        type: ProductVariantResponseDto,
        isArray: true,
    })
    async getAll(
        @Param('productId') productId: string,
    ): Promise<ProductVariantResponseDto[]> {
        return this.getProductVariantsService.execute(productId);
    }

    @Patch(':variantId')
    @ApiOperation({ summary: 'Update a product variant' })
    @ApiOkResponse({ type: ProductVariantResponseDto })
    async update(
        @Param('variantId') variantId: string,
        @Body() dto: UpdateProductVariantDto,
    ): Promise<ProductVariantResponseDto> {
        return this.updateProductVariantService.execute(variantId, dto);
    }

    @Delete(':variantId')
    @ApiOperation({ summary: 'Soft delete a product variant' })
    @ApiOkResponse({ type: ProductVariantResponseDto })
    async remove(
        @Param('variantId') variantId: string,
    ): Promise<ProductVariantResponseDto> {
        return this.deleteProductVariantService.execute(variantId);
    }
}

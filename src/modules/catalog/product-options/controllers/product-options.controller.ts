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
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

import { CreateProductOptionDto } from '../dto/requests/create-product-option.dto';
import { UpdateProductOptionDto } from '../dto/requests/update-product-option.dto';
import { ProductOptionResponseDto } from '../dto/responses/product-option-response.dto';
import { ProductVariantResponseDto } from '@/modules/catalog/product-variants/dto/responses/product-variant-response.dto';

import { CreateProductOptionService } from '../services/create-product-option.service';
import { DeleteProductOptionService } from '../services/delete-product-option.service';
import { GenerateProductVariantsService } from '../services/generate-product-variants.service';
import { GetProductOptionsService } from '../services/get-product-options.service';
import { UpdateProductOptionService } from '../services/update-product-option.service';

@ApiTags('Admin - Product Options')
@Controller('admin/product-options')
export class ProductOptionsController {
    constructor(
        private readonly createProductOptionService: CreateProductOptionService,
        private readonly getProductOptionsService: GetProductOptionsService,
        private readonly updateProductOptionService: UpdateProductOptionService,
        private readonly deleteProductOptionService: DeleteProductOptionService,
        private readonly generateProductVariantsService: GenerateProductVariantsService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a product option with values' })
    @ApiCreatedResponse({ type: ProductOptionResponseDto })
    async create(
        @Body() dto: CreateProductOptionDto,
    ): Promise<ProductOptionResponseDto> {
        return this.createProductOptionService.execute(dto);
    }

    @Get(':productId')
    @ApiOperation({ summary: 'Get all options for a product' })
    @ApiParam({ name: 'productId', example: 'cm123product456' })
    @ApiOkResponse({ type: ProductOptionResponseDto, isArray: true })
    async findAll(
        @Param('productId') productId: string,
    ): Promise<ProductOptionResponseDto[]> {
        return this.getProductOptionsService.execute(productId);
    }

    @Patch(':optionId')
    @ApiOperation({ summary: 'Update a product option' })
    @ApiParam({ name: 'optionId', example: 'cm123coloroption' })
    @ApiOkResponse({ type: ProductOptionResponseDto })
    async update(
        @Param('optionId') optionId: string,
        @Body() dto: UpdateProductOptionDto,
    ): Promise<ProductOptionResponseDto> {
        return this.updateProductOptionService.execute(optionId, dto);
    }

    @Delete(':optionId')
    @ApiOperation({ summary: 'Delete a product option' })
    @ApiParam({ name: 'optionId', example: 'cm123coloroption' })
    @ApiOkResponse({
        schema: {
            example: {
                message: 'Product option deleted successfully',
            },
        },
    })
    async remove(
        @Param('optionId') optionId: string,
    ): Promise<{ message: string }> {
        return this.deleteProductOptionService.execute(optionId);
    }

    @Post(':productId/generate-variants')
    @ApiOperation({
        summary: 'Generate product variants from all option combinations',
    })
    @ApiParam({ name: 'productId', example: 'cm123product456' })
    @ApiCreatedResponse({ type: ProductVariantResponseDto, isArray: true })
    async generateVariants(
        @Param('productId') productId: string,
    ): Promise<ProductVariantResponseDto[]> {
        return this.generateProductVariantsService.execute(productId);
    }
}

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

import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

// DTOs
import { AddProductImageDto } from '../dto/requests/add-product-image.dto';
import { UpdateProductImageDto } from '../dto/requests/update-product-image.dto';

// Services
import { AddProductImageService } from '../services/add-product-image.service';
import { UpdateProductImageService } from '../services/update-product-image.service';
import { DeleteProductImageService } from '../services/delete-product-image.service';

@ApiTags('Product Images')
@Controller('products/:productId/images')
export class ProductImageController {
    constructor(
        private readonly addProductImageService: AddProductImageService,

        private readonly updateProductImageService: UpdateProductImageService,

        private readonly deleteProductImageService: DeleteProductImageService,
    ) { }

    /**
     * Add product image
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Add an image to a product',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product ID',
    })
    async addImage(
        @Param('productId') productId: string,

        @Body() dto: AddProductImageDto,
    ) {
        const image = await this.addProductImageService.execute(productId, dto);

        return {
            message: 'Product image added successfully',
            data: image,
        };
    }

    /**
     * Update product image
     */
    @Patch(':imageId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update a product image',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product ID',
    })
    @ApiParam({
        name: 'imageId',
        description: 'Product image ID',
    })
    async updateImage(
        @Param('productId') productId: string,

        @Param('imageId') imageId: string,

        @Body() dto: UpdateProductImageDto,
    ) {
        const image = await this.updateProductImageService.execute(
            productId,
            imageId,
            dto,
        );

        return {
            message: 'Product image updated successfully',
            data: image,
        };
    }

    /**
     * Delete product image
     */
    @Delete(':imageId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete a product image',
    })
    @ApiParam({
        name: 'productId',
        description: 'Product ID',
    })
    @ApiParam({
        name: 'imageId',
        description: 'Product image ID',
    })
    async removeImage(
        @Param('productId') productId: string,

        @Param('imageId') imageId: string,
    ): Promise<void> {
        await this.deleteProductImageService.execute(productId, imageId);
    }
}

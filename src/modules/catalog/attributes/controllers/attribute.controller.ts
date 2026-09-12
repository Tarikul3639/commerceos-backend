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
} from '@nestjs/common';

import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

// DTOs
import { CreateAttributeDto } from '../dto/requests/create-attribute.dto';
import { UpdateAttributeDto } from '../dto/requests/update-attribute.dto';

// Services
import { CreateAttributeService } from '../services/create-attribute.service';
import { DeleteAttributeService } from '../services/delete-attribute.service';
import { GetAttributeService } from '../services/get-attribute.service';
import { GetAttributesService } from '../services/get-attributes.service';
import { UpdateAttributeService } from '../services/update-attribute.service';

@ApiTags('Attributes')
@Controller('attributes')
export class AttributeController {
    constructor(
        private readonly createAttributeService: CreateAttributeService,
        private readonly getAttributesService: GetAttributesService,
        private readonly getAttributeService: GetAttributeService,
        private readonly updateAttributeService: UpdateAttributeService,
        private readonly deleteAttributeService: DeleteAttributeService,
    ) { }

    /**
     * Create attribute
     *
     * Example:
     * Color
     * Size
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new attribute',
    })
    async create(@Body() createAttributeDto: CreateAttributeDto) {
        const attribute =
            await this.createAttributeService.execute(createAttributeDto);

        return {
            message: 'Attribute created successfully',
            data: attribute,
        };
    }

    /**
     * Get all attributes
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get all attributes',
    })
    async findAll() {
        const attributes = await this.getAttributesService.execute();

        return {
            data: attributes,
        };
    }

    /**
     * Get attribute by ID
     *
     * Includes all attribute values
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get attribute by ID',
    })
    @ApiParam({
        name: 'id',
        description: 'Attribute ID',
    })
    async findOne(@Param('id') attributeId: string) {
        const attribute = await this.getAttributeService.execute(attributeId);

        return {
            data: attribute,
        };
    }

    /**
     * Update attribute
     *
     * Example:
     * Color → Product Color
     */
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update an attribute',
    })
    @ApiParam({
        name: 'id',
        description: 'Attribute ID',
    })
    async update(
        @Param('id') attributeId: string,

        @Body() updateAttributeDto: UpdateAttributeDto,
    ) {
        const attribute = await this.updateAttributeService.execute(
            attributeId,
            updateAttributeDto,
        );

        return {
            message: 'Attribute updated successfully',
            data: attribute,
        };
    }

    /**
     * Delete attribute
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete an attribute',
    })
    @ApiParam({
        name: 'id',
        description: 'Attribute ID',
    })
    async remove(@Param('id') attributeId: string): Promise<void> {
        await this.deleteAttributeService.execute(attributeId);
    }
}

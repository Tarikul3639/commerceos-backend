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
        return await this.createAttributeService.execute(createAttributeDto);

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
        return await this.getAttributesService.execute();
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
        return await this.getAttributeService.execute(attributeId);
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
        return await this.updateAttributeService.execute(
            attributeId,
            updateAttributeDto,
        );
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

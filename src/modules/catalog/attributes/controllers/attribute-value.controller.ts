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
import { CreateAttributeValueDto } from '../dto/requests/create-attribute-value.dto';
import { UpdateAttributeValueDto } from '../dto/requests/update-attribute-value.dto';

// Services
import { CreateAttributeValueService } from '../services/create-attribute-value.service';
import { UpdateAttributeValueService } from '../services/update-attribute-value.service';
import { DeleteAttributeValueService } from '../services/delete-attribute-value.service';

@ApiTags('Attribute Values')
@Controller('attributes')
export class AttributeValueController {
    constructor(
        private readonly createAttributeValueService: CreateAttributeValueService,
        private readonly updateAttributeValueService: UpdateAttributeValueService,
        private readonly deleteAttributeValueService: DeleteAttributeValueService,
    ) { }

    /**
     * Add value to an attribute
     *
     * Example:
     *
     * Attribute: Color
     * Value: Red
     */
    @Post(':attributeId/values')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create an attribute value',
    })
    @ApiParam({
        name: 'attributeId',
        description: 'Attribute ID',
    })
    async create(
        @Param('attributeId') attributeId: string,

        @Body()
        createAttributeValueDto: CreateAttributeValueDto,
    ) {
        const attributeValue = await this.createAttributeValueService.execute(
            attributeId,
            createAttributeValueDto,
        );

        return {
            message: 'Attribute value created successfully',
            data: attributeValue,
        };
    }

    /**
     * Update attribute value
     *
     * Example:
     *
     * Red → Dark Red
     *
     * minimumStock:
     * 5 → 10
     */
    @Patch('values/:valueId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update an attribute value',
    })
    @ApiParam({
        name: 'valueId',
        description: 'Attribute value ID',
    })
    async update(
        @Param('valueId') valueId: string,

        @Body()
        updateAttributeValueDto: UpdateAttributeValueDto,
    ) {
        const attributeValue = await this.updateAttributeValueService.execute(
            valueId,
            updateAttributeValueDto,
        );

        return {
            message: 'Attribute value updated successfully',
            data: attributeValue,
        };
    }

    /**
     * Delete attribute value
     */
    @Delete('values/:valueId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete an attribute value',
    })
    @ApiParam({
        name: 'valueId',
        description: 'Attribute value ID',
    })
    async remove(@Param('valueId') valueId: string): Promise<void> {
        await this.deleteAttributeValueService.execute(valueId);
    }
}

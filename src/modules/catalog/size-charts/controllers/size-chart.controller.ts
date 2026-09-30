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
} from '@nestjs/common'
import {
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'

import { CreateSizeChartDto } from '../dto/requests/create-size-chart.dto'
import { CreateSizeChartItemDto } from '../dto/requests/create-size-chart-item.dto'
import { UpdateSizeChartDto } from '../dto/requests/update-size-chart.dto'
import { UpdateSizeChartItemDto } from '../dto/requests/update-size-chart-item.dto'
import { SizeChartResponseDto } from '../dto/responses/size-chart-response.dto'
import { CreateSizeChartService } from '../services/create-size-chart.service'
import { DeleteSizeChartService } from '../services/delete-size-chart.service'
import { GetSizeChartService } from '../services/get-size-chart.service'
import { GetSizeChartsService } from '../services/get-size-charts.service'
import { UpdateSizeChartService } from '../services/update-size-chart.service'

@ApiTags('Size Charts')
@Controller('size-charts')
export class SizeChartController {
    constructor(
        private readonly createService: CreateSizeChartService,
        private readonly deleteService: DeleteSizeChartService,
        private readonly getService: GetSizeChartService,
        private readonly getManyService: GetSizeChartsService,
        private readonly updateService: UpdateSizeChartService,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a size chart' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Size chart created successfully',
        type: SizeChartResponseDto,
    })
    create(@Body() dto: CreateSizeChartDto) {
        return this.createService.execute(dto)
    }

    @Get()
    @ApiOperation({ summary: 'Get size charts' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Size charts retrieved successfully',
        type: SizeChartResponseDto,
        isArray: true,
    })
    findAll(
        @Query()
        query: {
            search?: string
            page?: string
            limit?: string
        },
    ) {
        return this.getManyService.execute(query)
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a size chart' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Size chart retrieved successfully',
        type: SizeChartResponseDto,
    })
    findOne(@Param('id') id: string) {
        return this.getService.execute(id)
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a size chart' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Size chart updated successfully',
        type: SizeChartResponseDto,
    })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateSizeChartDto,
    ) {
        return this.updateService.execute(id, dto)
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a size chart' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Size chart deleted successfully',
    })
    remove(@Param('id') id: string): Promise<void> {
        return this.deleteService.execute(id)
    }

    @Post(':sizeChartId/items')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a size chart item' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Size chart item created successfully',
        type: SizeChartResponseDto,
    })
    createItem(
        @Param('sizeChartId') sizeChartId: string,
        @Body() dto: CreateSizeChartItemDto,
    ) {
        return this.createService.executeItem(sizeChartId, dto)
    }

    @Patch(':sizeChartId/items/:itemId')
    @ApiOperation({ summary: 'Update a size chart item' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Size chart item updated successfully',
        type: SizeChartResponseDto,
    })
    updateItem(
        @Param('sizeChartId') sizeChartId: string,
        @Param('itemId') itemId: string,
        @Body() dto: UpdateSizeChartItemDto,
    ) {
        return this.updateService.executeItem(
            sizeChartId,
            itemId,
            dto,
        )
    }

    @Delete(':sizeChartId/items/:itemId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a size chart item' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Size chart item deleted successfully',
    })
    removeItem(
        @Param('sizeChartId') sizeChartId: string,
        @Param('itemId') itemId: string,
    ): Promise<void> {
        return this.deleteService.executeItem(
            sizeChartId,
            itemId,
        )
    }
}

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
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { CreateSizeGuideDto } from '../dto/requests/create-size-guide.dto';
import { UpdateSizeGuideDto } from '../dto/requests/update-size-guide.dto';
import { SizeGuideQueryDto } from '../dto/requests/size-guide-query.dto';
import { SizeGuideResponseDto } from '../dto/responses/size-guide-response.dto';

import { CreateSizeGuideService } from '../services/create-size-guide.service';
import { GetSizeGuidesService } from '../services/get-size-guides.service';
import { GetSizeGuideDetailsService } from '../services/get-size-guide-details.service';
import { UpdateSizeGuideService } from '../services/update-size-guide.service';
import { DeleteSizeGuideService } from '../services/delete-size-guide.service';

@ApiTags('Admin Size Guides')
@Controller('admin/size-guides')
export class AdminSizeGuidesController {
    constructor(
        private readonly createSizeGuideService: CreateSizeGuideService,
        private readonly getSizeGuidesService: GetSizeGuidesService,
        private readonly getSizeGuideDetailsService: GetSizeGuideDetailsService,
        private readonly updateSizeGuideService: UpdateSizeGuideService,
        private readonly deleteSizeGuideService: DeleteSizeGuideService,
    ) { }

    /** Create a size guide */
    @Post()
    @ApiOperation({ summary: 'Create a size guide' })
    @ApiResponse({ status: 201, type: SizeGuideResponseDto })
    create(
        @Body() dto: CreateSizeGuideDto,
    ): Promise<SizeGuideResponseDto> {
        return this.createSizeGuideService.execute(dto);
    }

    /** Get all size guides */
    @Get()
    @ApiOperation({ summary: 'Get paginated size guides' })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getAll(@Query() query: SizeGuideQueryDto) {
        return this.getSizeGuidesService.execute(query);
    }

    /** Get size guide details */
    @Get(':id')
    @ApiOperation({ summary: 'Get size guide details' })
    @ApiParam({ name: 'id', description: 'Size guide ID' })
    @ApiResponse({ status: 200, type: SizeGuideResponseDto })
    getDetails(
        @Param('id') id: string,
    ): Promise<SizeGuideResponseDto> {
        return this.getSizeGuideDetailsService.execute(id);
    }

    /** Update a size guide */
    @Patch(':id')
    @ApiOperation({ summary: 'Update a size guide' })
    @ApiParam({ name: 'id', description: 'Size guide ID' })
    @ApiResponse({ status: 200, type: SizeGuideResponseDto })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateSizeGuideDto,
    ): Promise<SizeGuideResponseDto> {
        return this.updateSizeGuideService.execute(id, dto);
    }

    /** Delete a size guide */
    @Delete(':id')
    @ApiOperation({ summary: 'Delete an unused size guide' })
    @ApiParam({ name: 'id', description: 'Size guide ID' })
    delete(
        @Param('id') id: string,
    ): Promise<{ message: string }> {
        return this.deleteSizeGuideService.execute(id);
    }
}

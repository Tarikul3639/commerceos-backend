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

import {
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import { CreateBannerDto } from '../dto/requests/create-banner.dto';
import { UpdateBannerDto } from '../dto/requests/update-banner.dto';
import { BannerQueryDto } from '../dto/requests/banner-query.dto';

import { BannerResponseDto } from '../dto/responses/banner-response.dto';

import { CreateBannerService } from '../services/create-banner.service';
import { DeleteBannerService } from '../services/delete-banner.service';
import { GetBannerService } from '../services/get-banner.service';
import { GetBannersService } from '../services/get-banners.service';
import { UpdateBannerService } from '../services/update-banner.service';

@ApiTags('Banners')
@Controller('banners')
export class BannerController {
    constructor(
        private readonly createBannerService: CreateBannerService,
        private readonly getBannerService: GetBannerService,
        private readonly getBannersService: GetBannersService,
        private readonly updateBannerService: UpdateBannerService,
        private readonly deleteBannerService: DeleteBannerService,
    ) {}

    @Post()
    @ApiOperation({
        summary: 'Create a new banner',
    })
    @ApiCreatedResponse({
        type: BannerResponseDto,
    })
    async create(
        @Body() createBannerDto: CreateBannerDto,
    ): Promise<BannerResponseDto> {
        return this.createBannerService.execute(
            createBannerDto,
        );
    }

    @Get()
    @ApiOperation({
        summary: 'Get all banners',
    })
    async findAll(
        @Query() query: BannerQueryDto,
    ) {
        return this.getBannersService.execute(query);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get a banner by ID',
    })
    @ApiOkResponse({
        type: BannerResponseDto,
    })
    async findOne(
        @Param('id') id: string,
    ): Promise<BannerResponseDto> {
        return this.getBannerService.execute(id);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update a banner',
    })
    @ApiOkResponse({
        type: BannerResponseDto,
    })
    async update(
        @Param('id') id: string,

        @Body() updateBannerDto: UpdateBannerDto,
    ): Promise<BannerResponseDto> {
        return this.updateBannerService.execute(
            id,
            updateBannerDto,
        );
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete a banner',
    })
    async remove(
        @Param('id') id: string,
    ): Promise<void> {
        return this.deleteBannerService.execute(id);
    }
}
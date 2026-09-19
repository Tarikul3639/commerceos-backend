import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { CreatePurchaseReturnDto } from '../dto/requests/create-purchase-return.dto';
import { PurchaseReturnQueryDto } from '../dto/requests/purchase-return-query.dto';

import { PurchaseReturnResponseDto } from '../dto/responses/purchase-return-response.dto';

import { CreatePurchaseReturnService } from '../services/create-purchase-return.service';
import { GetPurchaseReturnService } from '../services/get-purchase-return.service';
import { GetPurchaseReturnsService } from '../services/get-purchase-returns.service';

@ApiTags('Purchase Returns')
@ApiBearerAuth()
@Controller('purchase-returns')
export class PurchaseReturnController {
    constructor(
        private readonly createPurchaseReturnService: CreatePurchaseReturnService,
        private readonly getPurchaseReturnService: GetPurchaseReturnService,
        private readonly getPurchaseReturnsService: GetPurchaseReturnsService,
    ) { }

    @Post()
    @ApiOperation({
        summary: 'Create a purchase return',
    })
    @ApiResponse({
        status: 201,
        type: PurchaseReturnResponseDto,
    })
    async create(
        @Body() createPurchaseReturnDto: CreatePurchaseReturnDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.createPurchaseReturnService.execute(
            userId,
            createPurchaseReturnDto,
        );
    }

    @Get()
    @ApiOperation({
        summary: 'Get all purchase returns',
    })
    async findAll(@Query() query: PurchaseReturnQueryDto) {
        return this.getPurchaseReturnsService.execute(query);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get purchase return by ID',
    })
    @ApiParam({
        name: 'id',
        type: String,
    })
    @ApiResponse({
        status: 200,
        type: PurchaseReturnResponseDto,
    })
    async findOne(@Param('id') id: string) {
        return this.getPurchaseReturnService.execute(id);
    }
}

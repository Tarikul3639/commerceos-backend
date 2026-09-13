import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Put,
    Query,
    Req,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '@/common/interfaces/current-user.interface';

import { CreatePurchaseDto } from '../dto/requests/create-purchase.dto';
import { UpdatePurchaseDto } from '../dto/requests/update-purchase.dto';
import { PurchaseQueryDto } from '../dto/requests/purchase-query.dto';
import { ReceivePurchaseDto } from '../dto/requests/receive-purchase.dto';
import { CancelPurchaseDto } from '../dto/requests/cancel-purchase.dto';

import { PurchaseResponseDto } from '../dto/responses/purchase-response.dto';

import { CreatePurchaseService } from '../services/create-purchase.service';
import { GetPurchaseService } from '../services/get-purchase.service';
import { GetPurchasesService } from '../services/get-purchases.service';
import { UpdatePurchaseService } from '../services/update-purchase.service';
import { ReceivePurchaseService } from '../services/receive-purchase.service';
import { CancelPurchaseService } from '../services/cancel-purchase.service';

@ApiTags('Purchases')
@ApiBearerAuth()
@Controller('purchases')
export class PurchaseController {
    constructor(
        private readonly createPurchaseService: CreatePurchaseService,
        private readonly getPurchaseService: GetPurchaseService,
        private readonly getPurchasesService: GetPurchasesService,
        private readonly updatePurchaseService: UpdatePurchaseService,
        private readonly receivePurchaseService: ReceivePurchaseService,
        private readonly cancelPurchaseService: CancelPurchaseService,
    ) { }

    @Post()
    @ApiOperation({
        summary: 'Create a new purchase',
    })
    @ApiResponse({
        status: 201,
        type: PurchaseResponseDto,
    })
    async create(
        @Body() createPurchaseDto: CreatePurchaseDto,
        @CurrentUser() user: CurrentUserPayload,
    ) {
        return this.createPurchaseService.execute(
            user.id,
            createPurchaseDto,
        );
    }

    @Get()
    @ApiOperation({
        summary: 'Get all purchases',
    })
    async findAll(
        @Query() query: PurchaseQueryDto,
    ) {
        return this.getPurchasesService.execute(query);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get purchase by ID',
    })
    @ApiParam({
        name: 'id',
        type: String,
    })
    @ApiResponse({
        status: 200,
        type: PurchaseResponseDto,
    })
    async findOne(
        @Param('id') id: string,
    ) {
        return this.getPurchaseService.execute(id);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Update a pending purchase',
    })
    @ApiParam({
        name: 'id',
        type: String,
    })
    @ApiResponse({
        status: 200,
        type: PurchaseResponseDto,
    })
    async update(
        @Param('id') id: string,
        @Body() updatePurchaseDto: UpdatePurchaseDto,
    ) {
        return this.updatePurchaseService.execute(
            id,
            updatePurchaseDto,
        );
    }

    @Patch(':id/receive')
    @ApiOperation({
        summary: 'Receive a purchase and add stock',
    })
    @ApiParam({
        name: 'id',
        type: String,
    })
    async receive(
        @Param('id') id: string,
        @Body() receivePurchaseDto: ReceivePurchaseDto,
        @CurrentUser() user: CurrentUserPayload,
    ) {
        return this.receivePurchaseService.execute(
            id,
            user.id,
            receivePurchaseDto,
        );
    }

    @Patch(':id/cancel')
    @ApiOperation({
        summary: 'Cancel a pending purchase',
    })
    @ApiParam({
        name: 'id',
        type: String,
    })
    async cancel(
        @Param('id') id: string,

        @Body() cancelPurchaseDto: CancelPurchaseDto,
    ) {
        return this.cancelPurchaseService.execute(
            id,

            cancelPurchaseDto,
        );
    }
}
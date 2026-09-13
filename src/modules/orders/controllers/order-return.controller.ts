import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
    Req,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

import { CreateOrderReturnDto } from '../dto/requests/create-order-return.dto';
import { OrderReturnQueryDto } from '../dto/requests/order-return-query.dto';

import { CreateOrderReturnService } from '../services/create-order-return.service';
import { GetOrderReturnService } from '../services/get-order-return.service';
import { GetOrderReturnsService } from '../services/get-order-returns.service';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../common/interfaces/current-user.interface';

@ApiTags('Order Returns')
@ApiBearerAuth()
@Controller('order-returns')
export class OrderReturnController {
    constructor(
        private readonly createOrderReturnService: CreateOrderReturnService,
        private readonly getOrderReturnService: GetOrderReturnService,
        private readonly getOrderReturnsService: GetOrderReturnsService,
    ) {}

    /**
     * Create Order Return
     */
    @Post('order/:orderId')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create an order return',
    })
    @ApiParam({
        name: 'orderId',
        example: 'clxxxxxxxxxxxxxxxx',
    })
    async create(
        @Param('orderId') orderId: string,

        @Body()
        createOrderReturnDto: CreateOrderReturnDto,

        @CurrentUser() user: CurrentUserPayload,
    ) {
        return this.createOrderReturnService.execute(
            orderId,
            createOrderReturnDto,
            user.id,
        );
    }

    /**
     * Get All Order Returns
     */
    @Get()
    @ApiOperation({
        summary: 'Get all order returns',
    })
    async findAll(
        @Query() query: OrderReturnQueryDto,
    ) {
        return this.getOrderReturnsService.execute(query);
    }

    /**
     * Get Single Order Return
     */
    @Get(':id')
    @ApiOperation({
        summary: 'Get order return by ID',
    })
    @ApiParam({
        name: 'id',
        example: 'clxxxxxxxxxxxxxxxx',
    })
    async findOne(
        @Param('id') orderReturnId: string,
    ) {
        return this.getOrderReturnService.execute(
            orderReturnId,
        );
    }
}
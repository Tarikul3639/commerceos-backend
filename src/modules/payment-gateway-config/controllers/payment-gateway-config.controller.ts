import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/lib/prisma/enums';

import { CreatePaymentGatewayConfigDto } from '../dto/requests/create-payment-gateway-config.dto';
import { UpdatePaymentGatewayConfigDto } from '../dto/requests/update-payment-gateway-config.dto';
import { PaymentGatewayConfigResponseDto } from '../dto/responses/payment-gateway-config-response.dto';

import { CreatePaymentGatewayConfigService } from '../services/create-payment-gateway-config.service';
import { GetPaymentGatewayConfigService } from '../services/get-payment-gateway-config.service';
import { GetPaymentGatewayConfigsService } from '../services/get-payment-gateway-configs.service';
import { UpdatePaymentGatewayConfigService } from '../services/update-payment-gateway-config.service';

@ApiTags('Payment Gateway Config')
@ApiBearerAuth()
@Controller('payment-gateway-config')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class PaymentGatewayConfigController {
    constructor(
        private readonly createService: CreatePaymentGatewayConfigService,
        private readonly getAllService: GetPaymentGatewayConfigsService,
        private readonly getOneService: GetPaymentGatewayConfigService,
        private readonly updateService: UpdatePaymentGatewayConfigService,
    ) { }

    @Post()
    @Permissions(Permission.ORDER_UPDATE)
    @ApiOperation({ summary: 'Create payment gateway configuration' })
    @ApiCreatedResponse({
        description: 'Payment gateway configuration created successfully',
        type: PaymentGatewayConfigResponseDto,
    })
    create(@Body() dto: CreatePaymentGatewayConfigDto) {
        return this.createService.execute(dto);
    }

    @Get()
    @Permissions(Permission.ORDER_READ)
    @ApiOperation({ summary: 'Get all payment gateway configurations' })
    @ApiOkResponse({
        description: 'Payment gateway configurations retrieved successfully',
        type: PaymentGatewayConfigResponseDto,
        isArray: true,
    })
    findAll() {
        return this.getAllService.execute();
    }

    @Get(':id')
    @Permissions(Permission.ORDER_READ)
    @ApiOperation({ summary: 'Get payment gateway configuration by ID' })
    @ApiOkResponse({
        description: 'Payment gateway configuration retrieved successfully',
        type: PaymentGatewayConfigResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Payment gateway configuration not found',
    })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.getOneService.execute(id);
    }

    @Patch(':id')
    @Permissions(Permission.ORDER_UPDATE)
    @ApiOperation({ summary: 'Update payment gateway configuration' })
    @ApiOkResponse({
        description: 'Payment gateway configuration updated successfully',
        type: PaymentGatewayConfigResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Payment gateway configuration not found',
    })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdatePaymentGatewayConfigDto,
    ) {
        return this.updateService.execute(id, dto);
    }
}

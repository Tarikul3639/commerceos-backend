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
  UseGuards,
} from '@nestjs/common';

import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

// DTOs
import { DiscountQueryDto } from '../dto/requests/discount-query.dto';
import { CreateDiscountDto } from '../dto/requests/create-discount.dto';
import { UpdateDiscountDto } from '../dto/requests/update-discount.dto';

import {
  DiscountResponseDto,
  DiscountResponseWithPaginationDto,
} from '../dto/responses/discount-response.dto';

// Services
import { GetDiscountsService } from '../services/get-discounts.service';
import { GetDiscountService } from '../services/get-discount.service';
import { DeleteDiscountService } from '../services/delete-discount.service';
import { CreateDiscountService } from '../services/create-discount.service';
import { UpdateDiscountService } from '../services/update-discount.service';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/lib/prisma/enums';

@ApiTags('Discounts')
@Controller('discounts')
export class DiscountController {
  constructor(
    private readonly createDiscountService: CreateDiscountService,
    private readonly updateDiscountService: UpdateDiscountService,
    private readonly getDiscountsService: GetDiscountsService,
    private readonly getDiscountService: GetDiscountService,
    private readonly deleteDiscountService: DeleteDiscountService,
  ) {}

  @Post()
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.DISCOUNT_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a product discount' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Discount created successfully',
    type: DiscountResponseDto,
  })
  async create(
    @Body() dto: CreateDiscountDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.createDiscountService.execute(userId, dto);
  }

  /**
   * Get all discounts
   */
  @Get()
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.DISCOUNT_READ)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of discounts',
    type: DiscountResponseWithPaginationDto,
  })
  @ApiOperation({
    summary: 'Get all discounts',
  })
  async findAll(@Query() query: DiscountQueryDto) {
    return await this.getDiscountsService.execute(query);
  }

  /**
   * Get discount by ID
   */
  @Get(':id')
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.DISCOUNT_READ)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get discount by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Discount ID',
  })
  async findOne(@Param('id') discountId: string) {
    return await this.getDiscountService.execute(discountId);
  }

  @Patch(':id')
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.DISCOUNT_UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a product discount' })
  @ApiParam({ name: 'id', description: 'Discount ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Discount updated successfully',
    type: DiscountResponseDto,
  })
  async update(
    @Param('id') discountId: string,
    @Body() dto: UpdateDiscountDto,
  ) {
    return this.updateDiscountService.execute(discountId, dto);
  }

  /**
   * Delete discount
   */
  @Delete(':id')
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.DISCOUNT_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete discount',
  })
  @ApiParam({
    name: 'id',
    description: 'Discount ID',
  })
  async remove(@Param('id') discountId: string): Promise<void> {
    await this.deleteDiscountService.execute(discountId);
  }
}

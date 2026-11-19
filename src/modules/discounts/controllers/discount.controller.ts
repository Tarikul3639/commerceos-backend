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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { Permission } from '@/lib/prisma/enums';
import { CreateDiscountDto } from '../dto/requests/create-discount.dto';
import { UpdateDiscountDto } from '../dto/requests/update-discount.dto';
import { DiscountQueryDto } from '../dto/requests/discount-query.dto';
import { DiscountResponseDto } from '../dto/responses/discount-response.dto';
import { DiscountListResponseDto } from '../dto/responses/discount-list-response.dto';
import { DiscountService } from '../services/discount.service';

@ApiTags('Discounts')
@ApiBearerAuth()
@Controller('discounts')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class DiscountController {
  constructor(private readonly discounts: DiscountService) {}

  @Post()
  @Permissions(Permission.DISCOUNT_CREATE)
  @ApiCreatedResponse({ type: DiscountResponseDto })
  create(@Body() dto: CreateDiscountDto, @CurrentUser('id') userId: string) {
    return this.discounts.create(userId, dto);
  }

  @Get()
  @Permissions(Permission.DISCOUNT_READ)
  @ApiOkResponse({ type: DiscountListResponseDto })
  list(@Query() query: DiscountQueryDto) {
    return this.discounts.list(query);
  }

  @Get(':id')
  @Permissions(Permission.DISCOUNT_READ)
  @ApiOkResponse({ type: DiscountResponseDto })
  get(@Param('id') id: string) {
    return this.discounts.get(id);
  }

  @Patch(':id')
  @Permissions(Permission.DISCOUNT_UPDATE)
  @ApiOkResponse({ type: DiscountResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDiscountDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.discounts.update(id, userId, dto);
  }

  @Delete(':id')
  @Permissions(Permission.DISCOUNT_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a discount code' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.discounts.remove(id, userId);
  }
}

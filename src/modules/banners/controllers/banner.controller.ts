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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CreateBannerDto } from '@/modules/banners/dto/requests/create-banner.dto';
import { UpdateBannerDto } from '@/modules/banners/dto/requests/update-banner.dto';
import { BannerQueryDto } from '@/modules/banners/dto/requests/banner-query.dto';

import { BannerResponseDto } from '@/modules/banners/dto/responses/banner-response.dto';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { Permission } from '@/lib/prisma/enums';

import { CreateBannerService } from '@/modules/banners/services/create-banner.service';
import { DeleteBannerService } from '@/modules/banners/services/delete-banner.service';
import { GetBannerService } from '@/modules/banners/services/get-banner.service';
import { GetBannersService } from '@/modules/banners/services/get-banners.service';
import { UpdateBannerService } from '@/modules/banners/services/update-banner.service';

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
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.BANNER_CREATE)
  @ApiOperation({
    summary: 'Create a new banner',
  })
  @ApiCreatedResponse({
    type: BannerResponseDto,
  })
  async create(
    @Body() createBannerDto: CreateBannerDto,
    @CurrentUser('id') userId: string,
  ): Promise<BannerResponseDto> {
    return this.createBannerService.execute(userId, createBannerDto);
  }

  @Get()
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.BANNER_READ)
  @ApiOperation({
    summary: 'Get all banners',
  })
  async findAll(@Query() query: BannerQueryDto) {
    return this.getBannersService.execute(query);
  }

  @Get(':id')
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.BANNER_READ)
  @ApiOperation({
    summary: 'Get a banner by ID',
  })
  @ApiOkResponse({
    type: BannerResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<BannerResponseDto> {
    return this.getBannerService.execute(id);
  }

  @Patch(':id')
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.BANNER_UPDATE)
  @ApiOperation({
    summary: 'Update a banner',
  })
  @ApiOkResponse({
    type: BannerResponseDto,
  })
  async update(
    @Param('id') id: string,

    @Body() updateBannerDto: UpdateBannerDto,
    @CurrentUser('id') userId: string,
  ): Promise<BannerResponseDto> {
    return this.updateBannerService.execute(id, userId, updateBannerDto);
  }

  @Delete(':id')
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.BANNER_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a banner',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.deleteBannerService.execute(id);
  }
}

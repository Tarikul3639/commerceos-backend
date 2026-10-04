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

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';

import { Permission } from '@/lib/prisma/enums';

import { CreateBannerDto } from '../dto/requests/create-banner.dto';
import { UpdateBannerDto } from '../dto/requests/update-banner.dto';
import { BannerQueryDto } from '../dto/requests/banner-query.dto';

import { BannerResponseDto } from '../dto/responses/banner-response.dto';
import { BannerListResponseDto } from '../dto/responses/banner-list-response.dto';

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

  // Create a new banner.
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

  // Get all banners with optional filters and pagination.
  @Get()
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.BANNER_READ)
  @ApiOperation({
    summary: 'Get all banners',
  })
  @ApiOkResponse({
    type: BannerListResponseDto,
  })
  async findAll(
    @Query() query: BannerQueryDto,
  ): Promise<BannerListResponseDto> {
    return this.getBannersService.execute(query);
  }

  // Get a single banner by ID.
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

  // Update an existing banner.
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

  // Delete a banner by ID.
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

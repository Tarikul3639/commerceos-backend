import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Permissions } from '../../../common/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { UserJwtAuthGuard } from '../../../common/guards/user-jwt-auth.guard.js';
import { Permission } from '../../../infrastructure/database/generated/prisma/enums.js';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CreateSizeGuideDto } from '../dto/requests/create-size-guide.dto.js';
import { UpdateSizeGuideDto } from '../dto/requests/update-size-guide.dto.js';
import { SizeGuideQueryDto } from '../dto/requests/size-guide-query.dto.js';
import { SizeGuideResponseDto } from '../dto/responses/size-guide-response.dto.js';

import { CreateSizeGuideService } from '../services/create-size-guide.service.js';
import { GetSizeGuidesService } from '../services/get-size-guides.service.js';
import { GetSizeGuideDetailsService } from '../services/get-size-guide-details.service.js';
import { UpdateSizeGuideService } from '../services/update-size-guide.service.js';
import { DeleteSizeGuideService } from '../services/delete-size-guide.service.js';

@ApiTags('Admin Size Guides')
@Controller('admin/size-guides')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class AdminSizeGuidesController {
  constructor(
    private readonly createSizeGuideService: CreateSizeGuideService,
    private readonly getSizeGuidesService: GetSizeGuidesService,
    private readonly getSizeGuideDetailsService: GetSizeGuideDetailsService,
    private readonly updateSizeGuideService: UpdateSizeGuideService,
    private readonly deleteSizeGuideService: DeleteSizeGuideService,
  ) {}

  /** Create a size guide */
  @Post()
  @Permissions(Permission.PRODUCT_CREATE)
  @ApiOperation({ summary: 'Create a size guide' })
  @ApiResponse({ status: 201, type: SizeGuideResponseDto })
  create(
    @Body() dto: CreateSizeGuideDto,
    @CurrentUser('id') userId: string,
  ): Promise<SizeGuideResponseDto> {
    return this.createSizeGuideService.execute(dto, userId);
  }

  /** Get all size guides */
  @Get()
  @Permissions(Permission.PRODUCT_READ)
  @ApiOperation({ summary: 'Get paginated size guides' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getAll(@Query() query: SizeGuideQueryDto) {
    return this.getSizeGuidesService.execute(query);
  }

  /** Get size guide details */
  @Get(':id')
  @Permissions(Permission.PRODUCT_READ)
  @ApiOperation({ summary: 'Get size guide details' })
  @ApiParam({ name: 'id', description: 'Size guide ID' })
  @ApiResponse({ status: 200, type: SizeGuideResponseDto })
  getDetails(@Param('id') id: string): Promise<SizeGuideResponseDto> {
    return this.getSizeGuideDetailsService.execute(id);
  }

  /** Update a size guide */
  @Patch(':id')
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Update a size guide' })
  @ApiParam({ name: 'id', description: 'Size guide ID' })
  @ApiResponse({ status: 200, type: SizeGuideResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSizeGuideDto,
    @CurrentUser('id') userId: string,
  ): Promise<SizeGuideResponseDto> {
    return this.updateSizeGuideService.execute(id, dto, userId);
  }

  /** Delete a size guide */
  @Delete(':id')
  @Permissions(Permission.PRODUCT_DELETE)
  @ApiOperation({ summary: 'Delete an unused size guide' })
  @ApiParam({ name: 'id', description: 'Size guide ID' })
  delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ message: string }> {
    return this.deleteSizeGuideService.execute(id, userId);
  }
}

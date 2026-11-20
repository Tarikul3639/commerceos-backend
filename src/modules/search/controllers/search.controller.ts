import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { UserJwtAuthGuard } from '../../../common/guards/user-jwt-auth.guard.js';
import { Role } from '../../../infrastructure/database/generated/prisma/enums.js';
import { SearchQueryDto } from '../dto/requests/search-query.dto.js';
import { SearchResponseDto } from '../dto/responses/search-response.dto.js';
import { GlobalSearchService } from '../services/global-search.service.js';

@ApiTags('Search')
@ApiBearerAuth()
@Controller('search')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class SearchController {
  constructor(private readonly globalSearchService: GlobalSearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Search Admin records available to the current staff user',
  })
  @ApiOkResponse({ type: SearchResponseDto })
  search(
    @Query() query: SearchQueryDto,
    @CurrentUser('role') role: Role,
  ): Promise<SearchResponseDto> {
    return this.globalSearchService.execute(query.q, role);
  }
}

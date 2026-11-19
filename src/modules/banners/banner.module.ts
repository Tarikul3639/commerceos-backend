import { Module } from '@nestjs/common';
import { UserJwtAuthGuard } from '../../common/guards/user-jwt-auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';

import { BannerController } from './controllers/banner.controller.js';

// Services
import { CreateBannerService } from './services/create-banner.service.js';
import { DeleteBannerService } from './services/delete-banner.service.js';
import { GetBannerService } from './services/get-banner.service.js';
import { GetBannersService } from './services/get-banners.service.js';
import { UpdateBannerService } from './services/update-banner.service.js';

@Module({
  controllers: [BannerController],

  providers: [
    CreateBannerService,
    GetBannerService,
    GetBannersService,
    UpdateBannerService,
    DeleteBannerService,
    UserJwtAuthGuard,
    PermissionsGuard,
  ],
})
export class BannerModule {}

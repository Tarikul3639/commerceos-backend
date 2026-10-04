import { Module } from '@nestjs/common';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';

import { BannerController } from './controllers/banner.controller';

// Services
import { CreateBannerService } from './services/create-banner.service';
import { DeleteBannerService } from './services/delete-banner.service';
import { GetBannerService } from './services/get-banner.service';
import { GetBannersService } from './services/get-banners.service';
import { UpdateBannerService } from './services/update-banner.service';

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

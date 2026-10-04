import { Module } from '@nestjs/common';

import { BannerController } from '@/modules/banners/controllers/banner.controller';

// Services
import { CreateBannerService } from '@/modules/banners/services/create-banner.service';
import { DeleteBannerService } from '@/modules/banners/services/delete-banner.service';
import { GetBannerService } from '@/modules/banners/services/get-banner.service';
import { GetBannersService } from '@/modules/banners/services/get-banners.service';
import { UpdateBannerService } from '@/modules/banners/services/update-banner.service';

@Module({
  controllers: [BannerController],

  providers: [
    CreateBannerService,
    GetBannerService,
    GetBannersService,
    UpdateBannerService,
    DeleteBannerService,
  ],
})
export class BannerModule {}

import { Module } from '@nestjs/common';

import { BannerController } from './controllers/banner.controller';

// Services
import { CreateBannerService } from './services/create-banner.service';
import { DeleteBannerService } from './services/delete-banner.service';
import { GetBannerService } from './services/get-banner.service';
import { GetBannersService } from './services/get-banners.service';
import { UpdateBannerService } from './services/update-banner.service';

@Module({
    controllers: [
        BannerController,
    ],

    providers: [
        CreateBannerService,
        GetBannerService,
        GetBannersService,
        UpdateBannerService,
        DeleteBannerService,
    ],
})
export class BannerModule {}
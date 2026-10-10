
import { Module } from '@nestjs/common';

import { PrismaModule } from '@/common/prisma/prisma.module';

import { AdminSizeGuidesController } from './controllers/admin-size-guides.controller';

import { CreateSizeGuideService } from './services/create-size-guide.service';
import { GetSizeGuidesService } from './services/get-size-guides.service';
import { GetSizeGuideDetailsService } from './services/get-size-guide-details.service';
import { UpdateSizeGuideService } from './services/update-size-guide.service';
import { DeleteSizeGuideService } from './services/delete-size-guide.service';

@Module({
    imports: [PrismaModule],
    controllers: [AdminSizeGuidesController],
    providers: [
        CreateSizeGuideService,
        GetSizeGuidesService,
        GetSizeGuideDetailsService,
        UpdateSizeGuideService,
        DeleteSizeGuideService,
    ],
    exports: [
        GetSizeGuidesService,
        GetSizeGuideDetailsService,
    ],
})
export class SizeGuideModule {}

import { Module } from '@nestjs/common';

import { PrismaModule } from '../../common/prisma/prisma.module.js';

import { AdminSizeGuidesController } from './controllers/admin-size-guides.controller.js';

import { CreateSizeGuideService } from './services/create-size-guide.service.js';
import { GetSizeGuidesService } from './services/get-size-guides.service.js';
import { GetSizeGuideDetailsService } from './services/get-size-guide-details.service.js';
import { UpdateSizeGuideService } from './services/update-size-guide.service.js';
import { DeleteSizeGuideService } from './services/delete-size-guide.service.js';

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
  exports: [GetSizeGuidesService, GetSizeGuideDetailsService],
})
export class SizeGuideModule {}

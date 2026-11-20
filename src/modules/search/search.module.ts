import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../infrastructure/database/database.module.js';
import { SearchController } from './controllers/search.controller.js';
import { GlobalSearchService } from './services/global-search.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [SearchController],
  providers: [GlobalSearchService],
})
export class SearchModule {}

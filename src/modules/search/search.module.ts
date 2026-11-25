import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../infrastructure/database/database.module.js';
import { SearchController } from './controllers/search.controller.js';
import { StoreSearchController } from './controllers/store-search.controller.js';
import { GlobalSearchService } from './services/global-search.service.js';
import { StoreProductSearchService } from './services/store-product-search.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [SearchController, StoreSearchController],
  providers: [GlobalSearchService, StoreProductSearchService],
})
export class SearchModule {}

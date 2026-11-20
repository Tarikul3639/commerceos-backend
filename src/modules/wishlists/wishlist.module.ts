import { Module } from '@nestjs/common';
import { AdminWishlistController } from './controllers/admin-wishlist.controller.js';
import { WishlistController } from './controllers/wishlist.controller.js';
import { AddWishlistItemService } from './services/add-wishlist-item.service.js';
import { ClearWishlistService } from './services/clear-wishlist.service.js';
import { GetAdminWishlistsService } from './services/get-admin-wishlists.service.js';
import { GetWishlistService } from './services/get-wishlist.service.js';
import { RemoveWishlistItemService } from './services/remove-wishlist-item.service.js';

@Module({
  controllers: [WishlistController, AdminWishlistController],
  providers: [
    GetWishlistService,
    AddWishlistItemService,
    RemoveWishlistItemService,
    ClearWishlistService,
    GetAdminWishlistsService,
  ],
})
export class WishlistModule {}

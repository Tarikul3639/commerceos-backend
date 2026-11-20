import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { AddWishlistItemService } from './add-wishlist-item.service.js';

describe('AddWishlistItemService', () => {
  it('adds a published product idempotently and returns the updated wishlist', async () => {
    const now = new Date();
    const wishlist = {
      id: 'wishlist-id',
      customerId: 'customer-id',
      createdAt: now,
      updatedAt: now,
      items: [],
    };
    const prisma = {
      product: {
        findFirst: vi.fn().mockResolvedValue({ id: 'product-id' }),
      },
      wishlist: {
        upsert: vi
          .fn()
          .mockResolvedValueOnce({ id: 'wishlist-id' })
          .mockResolvedValueOnce(wishlist),
      },
      wishlistItem: {
        upsert: vi.fn().mockResolvedValue({ id: 'item-id' }),
      },
    } as unknown as PrismaService;

    const result = await new AddWishlistItemService(prisma).execute(
      'customer-id',
      {
        productId: 'product-id',
      },
    );

    expect(prisma.wishlistItem.upsert).toHaveBeenCalledWith({
      where: {
        wishlistId_productId: {
          wishlistId: 'wishlist-id',
          productId: 'product-id',
        },
      },
      update: {},
      create: { wishlistId: 'wishlist-id', productId: 'product-id' },
    });
    expect(result).toEqual({
      id: 'wishlist-id',
      customerId: 'customer-id',
      createdAt: now,
      updatedAt: now,
      items: [],
    });
  });

  it('rejects products that are not published or have been deleted', async () => {
    const prisma = {
      product: { findFirst: vi.fn().mockResolvedValue(null) },
      wishlist: { upsert: vi.fn() },
      wishlistItem: { upsert: vi.fn() },
    } as unknown as PrismaService;

    await expect(
      new AddWishlistItemService(prisma).execute('customer-id', {
        productId: 'unavailable-product',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.wishlist.upsert).not.toHaveBeenCalled();
    expect(prisma.wishlistItem.upsert).not.toHaveBeenCalled();
  });
});

import { Prisma } from '../../../../infrastructure/database/generated/prisma/client.js';

import { StoreProductListItemDto } from '../dto/responses/store-product-list-response.dto.js';
import { getEffectiveProductPrice } from './effective-product-price.util.js';

type StoreProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    images: true;
    variants: { select: { stock: true } };
    productDiscount: true;
  };
}>;

/** Maps a published product and its active discount into the public storefront list contract. */
export function mapStoreProductListItem(
  product: StoreProductWithRelations,
): StoreProductListItemDto {
  const effectivePrice = getEffectiveProductPrice(
    product.sellingPrice,
    product.productDiscount,
  );
  const hasDiscount = effectivePrice.lessThan(product.sellingPrice);

  return {
    id: product.id,
    name: product.name,
    subDescription: product.subDescription,
    sellingPrice: effectivePrice.toString(),
    originalPrice: hasDiscount ? product.sellingPrice.toString() : null,
    discountPercentage: hasDiscount
      ? product.sellingPrice
          .minus(effectivePrice)
          .div(product.sellingPrice)
          .mul(100)
          .toFixed(0)
      : null,
    categoryId: product.categoryId,
    brandId: product.brandId,
    isFeatured: product.isFeatured,
    stock: product.variants.reduce(
      (total, variant) => total + variant.stock,
      0,
    ),
    createdAt: product.createdAt,
    images: product.images.map((image) => image.imageUrl),
  };
}

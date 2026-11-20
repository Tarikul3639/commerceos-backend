import { prisma } from './client.js';

const WISHLIST_FIXTURES = [
  {
    customerEmail: 'rahim@example.com',
    wishlistId: 'commerceos-wishlist-test-rahim',
    productId: 'commerceos-return-test-product',
  },
  {
    customerEmail: 'karim@example.com',
    wishlistId: 'commerceos-wishlist-test-karim',
    productId: 'commerceos-return-test-product',
  },
  {
    customerEmail: 'nusrat@example.com',
    wishlistId: 'commerceos-wishlist-test-nusrat',
    productId: 'commerceos-return-test-product',
  },
] as const;

/**
 * Add repeatable development fixtures for the Admin Wishlists overview.
 *
 * Existing customer wishlists are deliberately left untouched. A fixture is
 * created only when the customer does not already have a wishlist.
 */
export async function seedWishlists(): Promise<void> {
  console.log('🌱 Seeding Admin Wishlists test fixtures...');

  const product = await prisma.product.findFirst({
    where: {
      id: 'commerceos-return-test-product',
      status: 'PUBLISHED',
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!product) {
    throw new Error(
      'Wishlist fixture product not found or is not published. Run seedOrderReturns() first.',
    );
  }

  let createdCount = 0;

  for (const fixture of WISHLIST_FIXTURES) {
    const customer = await prisma.customer.findUnique({
      where: { email: fixture.customerEmail },
      select: { id: true },
    });

    if (!customer) {
      throw new Error(
        `Wishlist fixture customer ${fixture.customerEmail} not found. Run seedCustomers() first.`,
      );
    }

    const existingWishlist = await prisma.wishlist.findUnique({
      where: { customerId: customer.id },
      select: { id: true },
    });

    if (existingWishlist) {
      console.log(
        `  ↷ ${fixture.customerEmail}: wishlist already exists; leaving it unchanged.`,
      );
      continue;
    }

    await prisma.wishlist.create({
      data: {
        id: fixture.wishlistId,
        customerId: customer.id,
        items: {
          create: {
            productId: product.id,
          },
        },
      },
    });

    createdCount++;
    console.log(`  ✓ ${fixture.customerEmail}: 1 saved product`);
  }

  console.log(
    `✅ Wishlist fixtures completed. Created ${createdCount} wishlist(s); existing wishlists were not modified.`,
  );
}

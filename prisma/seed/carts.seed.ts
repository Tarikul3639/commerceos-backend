import { prisma } from './client';

const CART_FIXTURES = [
  {
    customerEmail: 'rahim@example.com',
    cartId: 'commerceos-cart-test-rahim',
    quantity: 2,
  },
  {
    customerEmail: 'karim@example.com',
    cartId: 'commerceos-cart-test-karim',
    quantity: 1,
  },
  {
    customerEmail: 'nusrat@example.com',
    cartId: 'commerceos-cart-test-nusrat',
    quantity: 3,
  },
] as const;

/**
 * Add repeatable development fixtures for the Admin Carts overview.
 *
 * Existing customer carts are deliberately left untouched. This seed only
 * creates a fixture cart when the customer does not already have one.
 */
export async function seedCarts(): Promise<void> {
  console.log('🌱 Seeding Admin Carts test fixtures...');

  const [product, variant] = await Promise.all([
    prisma.product.findUnique({
      where: { id: 'commerceos-return-test-product' },
      select: { id: true },
    }),
    prisma.productVariant.findUnique({
      where: { sku: 'COS-RETURN-TEST-SKU' },
      select: { id: true, productId: true },
    }),
  ]);

  if (!product || !variant || variant.productId !== product.id) {
    throw new Error(
      'Cart fixture product/variant not found. Run seedOrderReturns() first.',
    );
  }

  let createdCount = 0;

  for (const fixture of CART_FIXTURES) {
    const customer = await prisma.customer.findUnique({
      where: { email: fixture.customerEmail },
      select: { id: true },
    });

    if (!customer) {
      throw new Error(
        `Cart fixture customer ${fixture.customerEmail} not found. Run seedCustomers() first.`,
      );
    }

    const existingCart = await prisma.cart.findUnique({
      where: { customerId: customer.id },
      select: { id: true },
    });

    if (existingCart) {
      console.log(
        `  ↷ ${fixture.customerEmail}: cart already exists; leaving it unchanged.`,
      );
      continue;
    }

    await prisma.cart.create({
      data: {
        id: fixture.cartId,
        customerId: customer.id,
        items: {
          create: {
            quantity: fixture.quantity,
            productId: product.id,
            variantId: variant.id,
          },
        },
      },
    });

    createdCount++;
    console.log(`  ✓ ${fixture.customerEmail}: ${fixture.quantity} item(s)`);
  }

  console.log(
    `✅ Cart fixtures completed. Created ${createdCount} cart(s); existing carts were not modified.`,
  );
}

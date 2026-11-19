import {
  OrderReturnStatus,
  OrderStatus,
  PaymentStatus,
  Prisma,
  ProductStatus,
} from '../../src/infrastructure/database/generated/prisma/client.js';

import { prisma } from './client.js';

const SEED_PREFIX = 'COMMERCEOS-RETURN-TEST';

export async function seedOrderReturns(): Promise<void> {
  console.log('🌱 Seeding Order Returns test fixtures...');

  const [customer, staff] = await Promise.all([
    prisma.customer.findUnique({ where: { email: 'rahim@example.com' } }),
    prisma.user.findUnique({ where: { email: 'admin@example.com' } }),
  ]);

  if (!customer) {
    throw new Error(
      'Test customer not found. Run the existing customer seed first (rahim@example.com).',
    );
  }

  if (!staff) {
    throw new Error(
      'Test staff user not found. Run the existing user seed first (admin@example.com).',
    );
  }

  const category = await prisma.category.upsert({
    where: { slug: 'return-test-fixtures' },
    update: { name: 'Return Test Fixtures', isActive: true, deletedAt: null },
    create: {
      name: 'Return Test Fixtures',
      slug: 'return-test-fixtures',
      description: 'Development-only category for Order Returns test data.',
    },
  });

  const product = await prisma.product.upsert({
    where: { id: 'commerceos-return-test-product' },
    update: {
      name: 'Order Return Test Product',
      status: ProductStatus.PUBLISHED,
      categoryId: category.id,
    },
    create: {
      id: 'commerceos-return-test-product',
      name: 'Order Return Test Product',
      subDescription: 'Development-only fixture',
      description: 'Used to verify approve, reject and complete return workflows.',
      purchasePrice: new Prisma.Decimal(500),
      sellingPrice: new Prisma.Decimal(1000),
      status: ProductStatus.PUBLISHED,
      categoryId: category.id,
    },
  });

  const variant = await prisma.productVariant.upsert({
    where: { sku: 'COS-RETURN-TEST-SKU' },
    update: { productId: product.id, stock: 25, isActive: true, deletedAt: null },
    create: {
      productId: product.id,
      title: 'Default test variant',
      sku: 'COS-RETURN-TEST-SKU',
      stock: 25,
      isActive: true,
    },
  });

  const scenarios = [
    {
      key: 'APPROVE',
      returnNo: `${SEED_PREFIX}-APPROVE`,
      invoiceNo: `${SEED_PREFIX}-ORDER-APPROVE`,
      status: OrderReturnStatus.PENDING,
      reason: 'Customer requested a size exchange.',
    },
    {
      key: 'REJECT',
      returnNo: `${SEED_PREFIX}-REJECT`,
      invoiceNo: `${SEED_PREFIX}-ORDER-REJECT`,
      status: OrderReturnStatus.PENDING,
      reason: 'Customer reports a damaged package.',
    },
    {
      key: 'COMPLETE',
      returnNo: `${SEED_PREFIX}-COMPLETE`,
      invoiceNo: `${SEED_PREFIX}-ORDER-COMPLETE`,
      status: OrderReturnStatus.APPROVED,
      reason: 'Item received and inspected; ready to complete.',
    },
  ] as const;

  for (const scenario of scenarios) {
    const existingReturn = await prisma.orderReturn.findUnique({
      where: { returnNo: scenario.returnNo },
      select: { id: true },
    });

    if (existingReturn) {
      console.log(`  ↷ ${scenario.key}: already exists; leaving current test state unchanged.`);
      continue;
    }

    const order = await prisma.order.upsert({
      where: { invoiceNo: scenario.invoiceNo },
      update: {},
      create: {
        invoiceNo: scenario.invoiceNo,
        subtotal: new Prisma.Decimal(1000),
        discount: new Prisma.Decimal(0),
        tax: new Prisma.Decimal(0),
        total: new Prisma.Decimal(1000),
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.DELIVERED,
        customerId: customer.id,
        userId: staff.id,
        orderItems: {
          create: {
            quantity: 2,
            unitPrice: new Prisma.Decimal(500),
            subtotal: new Prisma.Decimal(1000),
            productId: product.id,
            variantId: variant.id,
            variantSku: variant.sku,
            variantColor: 'Test',
            variantSize: 'M',
          },
        },
      },
      include: { orderItems: true },
    });

    const orderItem = order.orderItems[0];
    if (!orderItem) {
      throw new Error(`No order item found for fixture ${scenario.key}.`);
    }

    await prisma.orderReturn.create({
      data: {
        returnNo: scenario.returnNo,
        status: scenario.status,
        reason: scenario.reason,
        orderId: order.id,
        createdById: staff.id,
        ...(scenario.status === OrderReturnStatus.APPROVED
          ? { approvedById: staff.id, approvedAt: new Date() }
          : {}),
        items: {
          create: {
            orderItemId: orderItem.id,
            quantity: 1,
            reason: scenario.reason,
          },
        },
      },
    });

    console.log(`  ✓ ${scenario.key}: ${scenario.returnNo}`);
  }

  console.log('\n✅ Order Returns test fixtures are ready.');
  console.log('Use the APPROVE and REJECT fixtures for pending actions.');
  console.log('Use the COMPLETE fixture to test stock restoration.');
  console.log('The script does not reset or overwrite an existing return decision.');
}


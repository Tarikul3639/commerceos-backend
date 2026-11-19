import { EmailStatus } from '../../src/infrastructure/database/generated/prisma/client.js';

import { prisma } from './client.js';

const SEED_PREFIX = 'commerceos-email-test';

export async function seedEmails(): Promise<void> {
  console.log('🌱 Seeding Email delivery log fixtures...');

  const staff = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
    select: { id: true },
  });

  if (!staff) {
    throw new Error(
      'Test staff user not found. Run the existing user seed first (admin@example.com).',
    );
  }

  const fixtures = [
    {
      id: `${SEED_PREFIX}-welcome-sent`,
      to: 'rahim@example.com',
      subject: 'Welcome to CommerceOS Store',
      body: 'Template: welcome-email',
      status: EmailStatus.SENT,
      attemptCount: 1,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      errorMessage: null,
      entityType: 'CUSTOMER',
      entityId: 'seed-customer-welcome',
    },
    {
      id: `${SEED_PREFIX}-order-confirmation-sent`,
      to: 'karim@example.com',
      subject: 'Your order has been confirmed',
      body: 'Template: order-confirmation',
      status: EmailStatus.SENT,
      attemptCount: 1,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
      errorMessage: null,
      entityType: 'ORDER',
      entityId: 'seed-order-confirmation',
    },
    {
      id: `${SEED_PREFIX}-verification-sent`,
      to: 'sadia@example.com',
      subject: 'Verify your email address',
      body: 'Template: email-verification',
      status: EmailStatus.SENT,
      attemptCount: 1,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
      errorMessage: null,
      entityType: 'CUSTOMER',
      entityId: 'seed-customer-verification',
    },
    {
      id: `${SEED_PREFIX}-password-reset-failed`,
      to: 'nabila@example.com',
      subject: 'Password reset request',
      body: 'Template: password-reset',
      status: EmailStatus.FAILED,
      attemptCount: 2,
      sentAt: null,
      errorMessage: 'Email delivery failed. Check server logs for diagnostics.',
      entityType: 'CUSTOMER',
      entityId: 'seed-customer-password-reset',
    },
    {
      id: `${SEED_PREFIX}-newsletter-pending`,
      to: 'test-recipient@example.com',
      subject: 'CommerceOS monthly update',
      body: 'Template: monthly-update',
      status: EmailStatus.PENDING,
      attemptCount: 0,
      sentAt: null,
      errorMessage: null,
      entityType: null,
      entityId: null,
    },
    {
      id: `${SEED_PREFIX}-invoice-failed`,
      to: 'invoice-test@example.com',
      subject: 'Your order invoice',
      body: 'Template: order-invoice',
      status: EmailStatus.FAILED,
      attemptCount: 1,
      sentAt: null,
      errorMessage: 'Email delivery failed. Check server logs for diagnostics.',
      entityType: 'ORDER',
      entityId: 'seed-order-invoice',
    },
  ] as const;

  for (const fixture of fixtures) {
    await prisma.emailLog.upsert({
      where: { id: fixture.id },
      update: {
        to: fixture.to,
        subject: fixture.subject,
        body: fixture.body,
        status: fixture.status,
        attemptCount: fixture.attemptCount,
        sentAt: fixture.sentAt,
        errorMessage: fixture.errorMessage,
        entityType: fixture.entityType,
        entityId: fixture.entityId,
        triggeredById: staff.id,
      },
      create: {
        ...fixture,
        triggeredById: staff.id,
      },
    });

    console.log(`  ✓ ${fixture.status}: ${fixture.subject}`);
  }

  console.log('✅ Email delivery log fixtures are ready.');
  console.log('Seeded fixture IDs use the commerceos-email-test prefix.');
}

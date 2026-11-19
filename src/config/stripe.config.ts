import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? '',
  secretKey: process.env.STRIPE_SECRET_KEY ?? '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
}));

import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeClient {
  private stripeInstance: Stripe | null = null;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Returns the lazily initialized Stripe SDK client.
   * The secret key is read from the private backend configuration and is
   * never exposed to callers or logged.
   */
  getClient(): Stripe {
    if (this.stripeInstance) {
      return this.stripeInstance;
    }

    const secretKey = this.configService.get<string>('stripe.secretKey');

    if (!secretKey) {
      throw new ServiceUnavailableException(
        'Stripe payment gateway is not configured.',
      );
    }

    this.stripeInstance = new Stripe(secretKey);

    return this.stripeInstance;
  }
}

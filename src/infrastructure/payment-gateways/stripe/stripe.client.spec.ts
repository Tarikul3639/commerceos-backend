import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { describe, expect, it, vi } from 'vitest';
import { StripeClient } from './stripe.client.js';

describe('StripeClient', () => {
  it('should throw when the Stripe secret key is not configured', () => {
    const getConfig = vi.fn().mockReturnValue('');
    const configService = {
      get: getConfig,
    } as unknown as ConfigService;
    const stripeClient = new StripeClient(configService);

    expect(() => stripeClient.getClient()).toThrow(ServiceUnavailableException);
    expect(getConfig).toHaveBeenCalledWith('stripe.secretKey');
  });

  it('should create and reuse the Stripe SDK instance', () => {
    const getConfig = vi.fn().mockReturnValue('sk_test_unit_test_only');
    const configService = {
      get: getConfig,
    } as unknown as ConfigService;
    const stripeClient = new StripeClient(configService);

    const firstClient = stripeClient.getClient();
    const secondClient = stripeClient.getClient();

    expect(firstClient).toBe(secondClient);
    expect(getConfig).toHaveBeenCalledTimes(1);
  });
});

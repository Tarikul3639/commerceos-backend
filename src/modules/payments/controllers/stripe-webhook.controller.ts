import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  ServiceUnavailableException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { RawBodyRequest } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeClient } from '../../../infrastructure/payment-gateways/stripe/stripe.client.js';
import { HandleStripeWebhookService } from '../services/handle-stripe-webhook.service.js';

@Controller('payments/webhooks')
export class StripeWebhookController {
  constructor(
    private readonly stripeClient: StripeClient,
    private readonly configService: ConfigService,
    private readonly handleStripeWebhookService: HandleStripeWebhookService,
  ) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ) {
    /*
     * Stripe signs each webhook request. Require both the signature header
     * and the original raw request body before attempting verification.
     * The raw body is necessary because parsing and re-serializing JSON
     * would change the bytes used to calculate the signature.
     */
    if (!signature || !request.rawBody) {
      throw new BadRequestException(
        'Missing Stripe webhook signature or raw request body.',
      );
    }

    /*
     * Read the webhook signing secret from backend configuration.
     * This is a separate secret from the Stripe API secret key and is used
     * only to verify that incoming webhook requests came from Stripe.
     */
    const webhookSecret = this.configService.get<string>(
      'stripe.webhookSecret',
    );
    if (!webhookSecret) {
      throw new ServiceUnavailableException(
        'Stripe webhook is not configured.',
      );
    }

    /*
     * Verify the Stripe signature and construct a trusted event object.
     * Reject the request if signature verification fails; never process
     * an unverified webhook payload.
     */
    let event: Stripe.Event;
    try {
      event = this.stripeClient
        .getClient()
        .webhooks.constructEvent(request.rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature.');
    }

    /*
     * Delegate payment and order status handling to the service.
     * Return HTTP 200 so Stripe knows the event was received successfully.
     */
    await this.handleStripeWebhookService.execute(event);
    return { received: true };
  }
}

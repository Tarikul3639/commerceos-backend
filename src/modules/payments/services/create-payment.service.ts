import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  Prisma,
  PaymentStatus,
  PaymentType,
} from '../../../infrastructure/database/generated/prisma/client.js';
import { PaymentProvider } from '../../../infrastructure/database/generated/prisma/enums.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { StripeStrategy } from '../../../infrastructure/payment-gateways/stripe/stripe.strategy.js';

import { CreatePaymentDto } from '../dto/requests/create-payment.dto.js';
import { PaymentResponseDto } from '../dto/responses/payment-response.dto.js';

@Injectable()
export class CreatePaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeStrategy: StripeStrategy,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    dto: CreatePaymentDto,
    customerId: string,
  ): Promise<PaymentResponseDto> {
    /*
     * Step 1: Verify that the order belongs to the authenticated customer.
     * This check must happen before the idempotency lookup to prevent
     * exposing another customer's payment information.
     */
    const ownedOrder = await this.prisma.order.findFirst({
      where: { id: dto.orderId, customerId },
      select: { id: true },
    });

    if (!ownedOrder) {
      throw new NotFoundException('Order not found');
    }

    /*
     * Step 2: Prevent duplicate payments when the client retries a request.
     * If the same idempotency key was used before, return the existing
     * payment instead of creating another payment record.
     */
    if (dto.idempotencyKey) {
      const existing = await this.prisma.payment.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });

      if (existing) {
        if (existing.orderId !== dto.orderId) {
          throw new BadRequestException(
            'Idempotency key has already been used for another order',
          );
        }

        /*
         * If a Stripe Checkout Session already exists, retrieve its checkout URL.
         * This allows the customer to continue checkout when the request is retried.
         */
        const response = this.toResponseDto(existing);
        if (
          existing.provider === PaymentProvider.STRIPE &&
          existing.sessionId
        ) {
          response.checkoutUrl =
            (await this.stripeStrategy.retrieveCheckoutSession(
              existing.sessionId,
            )) ?? undefined;
        }
        return response;
      }
    }

    /*
     * Step 3: Map the payment method selected by the customer to its
     * corresponding payment provider. For example, CARD uses Stripe,
     * while CASH is handled manually.
     */
    const providerByMethod: Record<string, PaymentProvider> = {
      CASH: PaymentProvider.MANUAL,
      CARD: PaymentProvider.STRIPE,
      BKASH: PaymentProvider.BKASH,
      NAGAD: PaymentProvider.NAGAD,
      ROCKET: PaymentProvider.ROCKET,
    };

    const provider = providerByMethod[dto.method];
    if (!provider) {
      throw new BadRequestException('Unsupported payment method');
    }

    /*
     * Step 4: Validate the order and create a PENDING payment inside a
     * database transaction. If any validation fails, the transaction
     * rolls back so no partial database changes are persisted.
     */
    const payment = await this.prisma.$transaction(async (tx) => {
      /*
       * Load the order again using both the order ID and customer ID.
       * Also fetch the product names and primary images required by checkout.
       */
      const order = await tx.order.findFirst({
        where: { id: dto.orderId, customerId },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  images: {
                    orderBy: { sortOrder: 'asc' },
                    take: 1,
                    select: { imageUrl: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }
      if (order.paymentStatus === PaymentStatus.PAID) {
        throw new BadRequestException('Order is already paid');
      }
      if (order.status === 'CANCELLED') {
        throw new BadRequestException('Cancelled orders cannot be paid');
      }
      if (!new Prisma.Decimal(dto.amount).equals(order.total)) {
        throw new BadRequestException(
          'Payment amount does not match order total',
        );
      }

      /*
       * Every non-manual payment gateway must be enabled in the admin settings.
       * Reject the request if the selected gateway is disabled.
       */
      if (provider !== PaymentProvider.MANUAL) {
        const config = await tx.paymentGateway.findUnique({
          where: { provider },
        });
        if (!config?.isEnabled) {
          throw new BadRequestException('Payment method is not enabled');
        }
      }

      /*
       * Stripe Checkout currently receives product prices as line items.
       * Until discount and tax handling is implemented, reject orders where
       * the final order total differs from the sum of product prices.
       */
      if (provider === PaymentProvider.STRIPE) {
        const itemsTotal = order.orderItems.reduce(
          (sum, item) => sum.add(item.unitPrice.mul(item.quantity)),
          new Prisma.Decimal(0),
        );

        /*
         * Stripe line items currently represent merchandise only.
         * Reject different totals until discount and tax handling is configured.
         */
        if (!itemsTotal.equals(order.total)) {
          throw new BadRequestException(
            'Stripe Checkout currently requires order total to equal the sum of item prices. Orders with discounts or tax adjustments are not supported yet.',
          );
        }

        for (const item of order.orderItems) {
          const imageUrl = item.product.images[0]?.imageUrl;
          if (imageUrl && !imageUrl.startsWith('https://')) {
            throw new BadRequestException(
              'Stripe product images must use publicly accessible HTTPS URLs.',
            );
          }
        }
      }

      /*
       * All validations have passed, so create the payment with PENDING status.
       * The customer has not paid yet. The payment becomes PAID only after
       * the verified Stripe webhook confirms successful payment.
       */
      const createdPayment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: order.total,
          method: dto.method,
          provider,
          type: PaymentType.PAYMENT,
          status: PaymentStatus.PENDING,
          ...(dto.idempotencyKey ? { idempotencyKey: dto.idempotencyKey } : {}),
        },
      });

      return {
        payment: createdPayment,
        order: {
          id: order.id,
          invoiceNo: order.invoiceNo,
          total: order.total.toString(),
          currency: createdPayment.currency,
          lineItems: order.orderItems.map((item) => ({
            name:
              item.variantColor || item.variantSize
                ? `${item.product.name} — ${[
                    item.variantColor,
                    item.variantSize,
                  ]
                    .filter(Boolean)
                    .join(' / ')}`
                : item.product.name,
            imageUrl: item.product.images[0]?.imageUrl,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
          })),
        },
      };
    });

    /*
     * Convert the payment returned from the transaction into the API response DTO.
     */
    const response = this.toResponseDto(payment.payment);

    /*
     * Step 5: Create the Stripe Checkout Session after the database transaction.
     * External network requests are kept outside the transaction because they
     * may take time and would otherwise keep the database transaction open.
     */
    if (provider === PaymentProvider.STRIPE) {
      /*
       * Get the frontend base URL used to redirect the customer after
       * completing or cancelling the Stripe Checkout flow.
       */
      const frontendUrl = this.configService.get<string>('app.frontendUrl');
      if (!frontendUrl) {
        throw new BadRequestException(
          'FRONTEND_URL must be configured to start Stripe Checkout.',
        );
      }

      /*
       * Stripe redirects the customer to this URL after checkout.
       * Stripe replaces the session ID placeholder with the actual session ID.
       */
      const successUrl = new URL('/checkout/success', frontendUrl);
      successUrl.searchParams.set('payment_id', payment.payment.id);
      successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');

      /*
       * Redirect the customer to the frontend cancellation page
       * if they cancel the checkout process.
       */
      const cancelUrl = new URL('/checkout/cancel', frontendUrl);
      cancelUrl.searchParams.set('payment_id', payment.payment.id);

      /*
       * Create a hosted Stripe Checkout Session using the order's products,
       * amount, currency, payment references, and redirect URLs.
       * The idempotency key also prevents duplicate sessions at the Stripe API level.
       */
      const session = await this.stripeStrategy.createCheckoutSession({
        paymentId: payment.payment.id,
        orderId: payment.order.id,
        invoiceNo: payment.order.invoiceNo,
        currency: payment.order.currency,
        lineItems: payment.order.lineItems,
        successUrl: successUrl.toString(),
        cancelUrl: cancelUrl.toString(),
        idempotencyKey:
          dto.idempotencyKey ?? `commerceos-payment-${payment.payment.id}`,
      });

      /*
       * Save the Stripe session ID on the payment record.
       * If the request is retried later, this ID can be used to retrieve
       * the existing Checkout Session URL instead of creating another session.
       */
      await this.prisma.payment.update({
        where: { id: payment.payment.id },
        data: { sessionId: session.sessionId },
      });

      response.checkoutUrl = session.checkoutUrl;
    }

    return response;
  }

  /*
   * Map the Prisma Payment model to the public API response shape.
   * This prevents internal or unnecessary database fields from being
   * exposed directly to the client.
   */
  private toResponseDto(
    payment: Prisma.PaymentGetPayload<object>,
  ): PaymentResponseDto {
    return {
      id: payment.id,
      orderId: payment.orderId,
      amount: payment.amount.toString(),
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      type: payment.type,
      transactionId: payment.transactionId,
      notes: payment.notes,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}

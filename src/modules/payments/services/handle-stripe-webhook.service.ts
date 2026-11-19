import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import {
  PaymentStatus,
  PaymentType,
} from '../../../infrastructure/database/generated/prisma/enums.js';
import { Prisma } from '../../../infrastructure/database/generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { PaymentProvider } from '../../../infrastructure/database/generated/prisma/enums.js';
import { toStripeMinorUnits } from '../../../infrastructure/payment-gateways/stripe/stripe.mapper.js';

@Injectable()
export class HandleStripeWebhookService {
  private readonly logger = new Logger(HandleStripeWebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(event: Stripe.Event): Promise<void> {
    /*
     * Process only the Checkout Session events that can change a payment's status.
     * All other Stripe events are ignored because they are not handled by this service.
     */
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired':
        await this.handleCheckoutSession(event);
        return;
      default:
        this.logger.debug(`Ignoring unsupported Stripe event: ${event.type}`);
    }
  }

  private async handleCheckoutSession(event: Stripe.Event): Promise<void> {
    /*
     * Extract the Checkout Session and the internal payment/order references
     * that were attached as metadata when the session was originally created.
     */
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentId = session.metadata?.paymentId;
    const orderId = session.metadata?.orderId;

    /*
     * Reject incomplete or unexpected sessions before querying the database.
     * A valid payment Checkout Session must contain the expected metadata,
     * payment mode, total amount, and currency.
     */
    if (
      !paymentId ||
      !orderId ||
      session.mode !== 'payment' ||
      !session.amount_total ||
      !session.currency
    ) {
      this.logger.warn(`Ignoring incomplete Stripe Checkout event ${event.id}`);
      return;
    }

    /*
     * Use a serializable transaction so concurrent webhook deliveries cannot
     * safely apply conflicting payment and order status changes.
     */
    await this.prisma.$transaction(
      async (tx) => {
        /*
         * Find the payment referenced by Stripe and load its related order.
         * The stored values are checked against the event before any update
         * so an unrelated or forged session cannot modify a payment.
         */
        const payment = await tx.payment.findUnique({
          where: { id: paymentId },
          include: { order: { select: { id: true, status: true } } },
        });

        /*
         * Confirm that this is a Stripe payment for the expected order and
         * that the event refers to the exact Checkout Session saved in our database.
         * The client reference must also match the internal payment ID.
         */
        if (
          !payment ||
          payment.type !== PaymentType.PAYMENT ||
          payment.provider !== PaymentProvider.STRIPE ||
          payment.orderId !== orderId ||
          payment.sessionId !== session.id ||
          session.client_reference_id !== payment.id
        ) {
          this.logger.warn(
            `Stripe event ${event.id} did not match a stored payment`,
          );
          return;
        }

        /*
         * Verify the amount and currency reported by Stripe against the
         * values stored for this payment. This prevents accepting a session
         * created for a different amount or currency.
         */
        const expectedAmount = toStripeMinorUnits(payment.amount.toString());
        if (
          session.amount_total !== expectedAmount ||
          session.currency?.toLowerCase() !== payment.currency.toLowerCase()
        ) {
          this.logger.error(
            `Stripe amount/currency mismatch for payment ${payment.id}`,
          );
          return;
        }

        /*
         * Only PENDING payments may transition to another status.
         * This makes repeated webhook deliveries and late events harmless
         * after a payment has already reached a terminal state.
         */
        if (payment.status !== PaymentStatus.PENDING) {
          return;
        }

        /*
         * Determine the next internal payment status from the verified event.
         * A completed or asynchronously succeeded session is considered paid
         * only when Stripe explicitly reports payment_status as "paid".
         */
        let nextStatus: PaymentStatus | null = null;
        if (
          (event.type === 'checkout.session.completed' ||
            event.type === 'checkout.session.async_payment_succeeded') &&
          session.payment_status === 'paid'
        ) {
          nextStatus = PaymentStatus.PAID;
        } else if (event.type === 'checkout.session.async_payment_failed') {
          nextStatus = PaymentStatus.FAILED;
        } else if (event.type === 'checkout.session.expired') {
          nextStatus = PaymentStatus.CANCELLED;
        }

        /*
         * A completed Checkout Session may still be awaiting payment when
         * delayed payment methods are used. Do not change the payment status
         * until Stripe sends an event confirming a final outcome.
         */
        if (!nextStatus) {
          return;
        }

        /*
         * Stripe may provide the PaymentIntent as either an ID string
         * or an expanded object. Store its ID as the transaction reference
         * when it is available.
         */
        const transactionId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id;

        /*
         * Apply the status change conditionally. The WHERE clause repeats the
         * critical checks so concurrent or duplicate events cannot overwrite
         * a payment that is no longer PENDING or belongs to another session.
         */
        const updated = await tx.payment.updateMany({
          where: {
            id: payment.id,
            provider: PaymentProvider.STRIPE,
            type: PaymentType.PAYMENT,
            status: PaymentStatus.PENDING,
            sessionId: session.id,
          },
          data: {
            status: nextStatus,
            ...(transactionId ? { transactionId } : {}),
          },
        });

        /*
         * If another request already changed the payment, no order update
         * is needed because this event did not perform the status transition.
         */
        if (updated.count === 0) {
          return;
        }

        /*
         * Recalculate the order's payment status using all its payment records.
         * A successful payment takes priority; otherwise keep the order PENDING
         * if another payment attempt is still in progress.
         */
        const [paidPayment, pendingPayment] = await Promise.all([
          tx.payment.findFirst({
            where: {
              orderId: payment.orderId,
              type: PaymentType.PAYMENT,
              status: PaymentStatus.PAID,
            },
            select: { id: true },
          }),
          tx.payment.findFirst({
            where: {
              orderId: payment.orderId,
              type: PaymentType.PAYMENT,
              status: PaymentStatus.PENDING,
            },
            select: { id: true },
          }),
        ]);

        /*
         * Set the order status based on the remaining payment records:
         * PAID if any payment succeeded, PENDING if another attempt is active,
         * or the current payment's final status if no attempts remain.
         */
        const orderPaymentStatus = paidPayment
          ? PaymentStatus.PAID
          : pendingPayment
            ? PaymentStatus.PENDING
            : nextStatus;

        await tx.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: orderPaymentStatus },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}

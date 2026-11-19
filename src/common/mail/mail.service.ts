import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { MailOptions } from './interfaces/mail-options.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailStatus } from '../../lib/prisma/client.js';

import {
  NewOrderNotificationTemplate,
  NotificationTemplate,
  OrderCancelledTemplate,
  OrderConfirmationTemplate,
  OrderDeliveredTemplate,
  OrderProcessingTemplate,
  OrderShippedTemplate,
  ResetPasswordTemplate,
  VerifyEmailTemplate,
  WelcomeTemplate,
} from './interfaces/mail-template.interface.js';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Persist a safe delivery summary before sending. Rendered content and
   * template context are intentionally never stored in the email log.
   */
  async sendMail(mailOptions: MailOptions): Promise<void> {
    const recipients = Array.isArray(mailOptions.to)
      ? mailOptions.to
      : mailOptions.to
        ? [mailOptions.to]
        : [];
    const recipient = recipients
      .map((item) => (typeof item === 'string' ? item : item.address))
      .join(', ');
    const subject = String(mailOptions.subject ?? '');
    const preview =
      typeof mailOptions.template === 'string'
        ? 'Template: ' + mailOptions.template
        : 'Transactional email';

    const log = await this.prisma.emailLog.create({
      data: {
        to: recipient,
        subject,
        body: preview,
        status: EmailStatus.PENDING,
        attemptCount: 1,
      },
    });

    try {
      await this.mailerService.sendMail(mailOptions);
    } catch (error: unknown) {
      await this.prisma.emailLog.update({
        where: { id: log.id },
        data: {
          status: EmailStatus.FAILED,
          errorMessage:
            'Email delivery failed. Check server logs for diagnostics.',
        },
      });

      if (error instanceof Error) {
        this.logger.error('Failed to send email to ' + recipient, error.stack);
      } else {
        this.logger.error('Failed to send email to ' + recipient);
      }
      throw error;
    }

    await this.prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: EmailStatus.SENT,
        sentAt: new Date(),
        errorMessage: null,
      },
    });
    this.logger.log('Email sent successfully to ' + recipient);
  }

  /**
   * Send a verification email to the user.
   * @param to The recipient's email address.
   * @param context The context for the email template.
   */
  async sendVerifyEmail(
    to: string,
    context: VerifyEmailTemplate,
  ): Promise<void> {
    await this.sendMail({
      to,
      subject: 'Verify your email address',
      template: 'auth/verify-email',
      context,
    });
  }

  async sendResetPasswordEmail(
    to: string,
    context: ResetPasswordTemplate,
  ): Promise<void> {
    await this.sendMail({
      to,
      subject: 'Reset your password',
      template: 'auth/reset-password',
      context,
    });
  }

  async sendWelcomeEmail(to: string, context: WelcomeTemplate): Promise<void> {
    await this.sendMail({
      to,
      subject: `Welcome to ${context.appName}`,
      template: 'auth/welcome',
      context,
    });
  }

  /**
   * Send a notification email to the user.
   * @param to The recipient's email address.
   * @param context The context for the email template.
   */
  async sendNotification(
    to: string,
    context: NotificationTemplate,
    category?: 'orders' | 'returns' | 'inventory' | 'payments',
  ): Promise<void> {
    if (category) {
      const preferences = await this.prisma.notificationPreferences.findUnique({
        where: { id: 'default' },
      });
      const emailPreference = {
        orders: 'ordersEmail',
        returns: 'returnsEmail',
        inventory: 'inventoryEmail',
        payments: 'paymentsEmail',
      }[category] as
        'ordersEmail' | 'returnsEmail' | 'inventoryEmail' | 'paymentsEmail';
      if (preferences && !preferences[emailPreference]) return;
    }

    await this.sendMail({
      to,
      subject: context.title,
      template: 'common/notification',
      context,
    });
  }

  /**
   * Send a new order notification email to the user.
   * @param to The recipient's email address.
   * @param context The context for the email template.
   */
  async sendNewOrderNotification(
    to: string,
    context: NewOrderNotificationTemplate,
  ): Promise<void> {
    const preferences = await this.prisma.notificationPreferences.findUnique({
      where: { id: 'default' },
    });
    if (preferences && !preferences.ordersEmail) return;

    await this.sendMail({
      to,
      subject: `New order #${context.orderNumber}`,
      template: 'order/new-order-notification',
      context,
    });
  }

  async sendOrderConfirmation(
    to: string,
    context: OrderConfirmationTemplate,
  ): Promise<void> {
    await this.sendMail({
      to,
      subject: `Order confirmed #${context.orderNumber}`,
      template: 'order/order-confirmation',
      context,
    });
  }

  async sendOrderProcessing(
    to: string,
    context: OrderProcessingTemplate,
  ): Promise<void> {
    await this.sendMail({
      to,
      subject: `Your order is being processed #${context.orderNumber}`,
      template: 'order/order-processing',
      context,
    });
  }

  async sendOrderShipped(
    to: string,
    context: OrderShippedTemplate,
  ): Promise<void> {
    await this.sendMail({
      to,
      subject: `Your order has been shipped #${context.orderNumber}`,
      template: 'order/order-shipped',
      context,
    });
  }

  async sendOrderDelivered(
    to: string,
    context: OrderDeliveredTemplate,
  ): Promise<void> {
    await this.sendMail({
      to,
      subject: `Your order has been delivered #${context.orderNumber}`,
      template: 'order/order-delivered',
      context,
    });
  }

  async sendOrderCancelled(
    to: string,
    context: OrderCancelledTemplate,
  ): Promise<void> {
    await this.sendMail({
      to,
      subject: `Order cancelled #${context.orderNumber}`,
      template: 'order/order-cancelled',
      context,
    });
  }
}

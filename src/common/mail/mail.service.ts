import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { MailOptions } from './interfaces/mail-options.interface';

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
} from './interfaces/mail-template.interface';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(private readonly mailerService: MailerService) { }

    /** 
     * Base mail method
    * @param mailOptions The options for sending the email.
     * */
    async sendMail(mailOptions: MailOptions): Promise<void> {
        try {
            await this.mailerService.sendMail(mailOptions);

            this.logger.log(`Email sent successfully to ${mailOptions.to}`);
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.logger.error(
                    `Failed to send email to ${mailOptions.to}`,
                    error.stack,
                );
            } else {
                this.logger.error(`Failed to send email to ${mailOptions.to}`);
            }

            throw error;
        }
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
    ): Promise<void> {
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

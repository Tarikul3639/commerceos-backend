import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { MailService } from '../../../common/mail/mail.service';

import { EmailStatus } from '@/lib/prisma/client';

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
} from '../../../common/mail/interfaces/mail-template.interface';

@Injectable()
export class EmailLogService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mailService: MailService,
    ) { }

    /**
     * Create email log
     */
    private async create(data: {
        to: string;
        subject: string;
        body: string;
        entityType?: string;
        entityId?: string;
        triggeredById?: string;
    }) {
        return this.prisma.emailLog.create({
            data: {
                to: data.to,
                subject: data.subject,
                body: data.body,

                ...(data.entityType !== undefined && {
                    entityType: data.entityType,
                }),

                ...(data.entityId !== undefined && {
                    entityId: data.entityId,
                }),

                ...(data.triggeredById !== undefined && {
                    triggeredById: data.triggeredById,
                }),
            },
        });
    }

    /**
     * Mark email as sending
     */
    private async markSending(id: string) {
        return this.prisma.emailLog.update({
            where: {
                id,
            },
            data: {
                status: EmailStatus.PENDING,
                attemptCount: {
                    increment: 1,
                },
            },
        });
    }

    /**
     * Mark email as sent
     */
    private async markSent(id: string) {
        return this.prisma.emailLog.update({
            where: {
                id,
            },
            data: {
                status: EmailStatus.SENT,
                sentAt: new Date(),
                errorMessage: null,
            },
        });
    }

    /**
     * Mark email as failed
     */
    private async markFailed(id: string, errorMessage: string) {
        return this.prisma.emailLog.update({
            where: {
                id,
            },
            data: {
                status: EmailStatus.FAILED,
                errorMessage,
            },
        });
    }

    /**
     * Execute email sending lifecycle
     *
     * 1. Create log
     * 2. Mark as SENDING
     * 3. Send email
     * 4. Mark as SENT
     * 5. If failed -> Mark as FAILED
     */
    private async executeEmail(data: {
        to: string;
        subject: string;
        body: string;
        entityType?: string;
        entityId?: string;
        triggeredById?: string;
        send: () => Promise<void>;
    }) {
        const emailLog = await this.create({
            to: data.to,
            subject: data.subject,
            body: data.body,

            ...(data.entityType !== undefined && {
                entityType: data.entityType,
            }),

            ...(data.entityId !== undefined && {
                entityId: data.entityId,
            }),

            ...(data.triggeredById !== undefined && {
                triggeredById: data.triggeredById,
            }),
        });

        try {
            await this.markSending(emailLog.id);

            await data.send();

            return await this.markSent(emailLog.id);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to send email';

            await this.markFailed(emailLog.id, errorMessage);

            throw new InternalServerErrorException('Failed to send email');
        }
    }

    /**
     * Send verification email
     */
    async sendVerifyEmail(
        to: string,
        context: VerifyEmailTemplate,
        triggeredById?: string,
    ) {
        return this.executeEmail({
            to,
            subject: 'Verify your email address',
            body: 'Verification email',

            ...(triggeredById !== undefined && {
                triggeredById,
            }),

            send: () => this.mailService.sendVerifyEmail(to, context),
        });
    }

    /**
     * Send reset password email
     */
    async sendResetPasswordEmail(
        to: string,
        context: ResetPasswordTemplate,
        triggeredById?: string,
    ) {
        return this.executeEmail({
            to,
            subject: 'Reset your password',
            body: 'Reset password email',

            ...(triggeredById !== undefined && {
                triggeredById,
            }),

            send: () => this.mailService.sendResetPasswordEmail(to, context),
        });
    }

    /**
     * Send welcome email
     */
    async sendWelcomeEmail(
        to: string,
        context: WelcomeTemplate,
        triggeredById?: string,
    ) {
        return this.executeEmail({
            to,
            subject: `Welcome to ${context.appName}`,
            body: 'Welcome email',

            ...(triggeredById !== undefined && {
                triggeredById,
            }),

            send: () => this.mailService.sendWelcomeEmail(to, context),
        });
    }

    /**
     * Send generic notification email
     */
    async sendNotification(
        to: string,
        context: NotificationTemplate,
        options?: {
            entityType?: string;
            entityId?: string;
            triggeredById?: string;
        },
    ) {
        return this.executeEmail({
            to,
            subject: context.title,
            body: context.message,

            ...(options?.entityType !== undefined && {
                entityType: options.entityType,
            }),

            ...(options?.entityId !== undefined && {
                entityId: options.entityId,
            }),

            ...(options?.triggeredById !== undefined && {
                triggeredById: options.triggeredById,
            }),

            send: () => this.mailService.sendNotification(to, context),
        });
    }

    /**
     * Send new order notification email
     */
    async sendNewOrderNotification(
        to: string,
        context: NewOrderNotificationTemplate,
        options?: {
            entityId?: string;
            triggeredById?: string;
        },
    ) {
        return this.executeEmail({
            to,
            subject: `New order #${context.orderNumber}`,
            body: `New order notification #${context.orderNumber}`,
            entityType: 'Order',

            ...(options?.entityId !== undefined && {
                entityId: options.entityId,
            }),

            ...(options?.triggeredById !== undefined && {
                triggeredById: options.triggeredById,
            }),

            send: () => this.mailService.sendNewOrderNotification(to, context),
        });
    }

    /**
     * Send order confirmation email
     */
    async sendOrderConfirmation(
        to: string,
        context: OrderConfirmationTemplate,
        options?: {
            entityId?: string;
            triggeredById?: string;
        },
    ) {
        return this.executeEmail({
            to,
            subject: `Order confirmed #${context.orderNumber}`,
            body: `Order confirmation #${context.orderNumber}`,
            entityType: 'Order',

            ...(options?.entityId !== undefined && {
                entityId: options.entityId,
            }),

            ...(options?.triggeredById !== undefined && {
                triggeredById: options.triggeredById,
            }),

            send: () => this.mailService.sendOrderConfirmation(to, context),
        });
    }

    /**
     * Send order processing email
     */
    async sendOrderProcessing(
        to: string,
        context: OrderProcessingTemplate,
        options?: {
            entityId?: string;
            triggeredById?: string;
        },
    ) {
        return this.executeEmail({
            to,
            subject: `Your order is being processed #${context.orderNumber}`,
            body: `Order processing #${context.orderNumber}`,
            entityType: 'Order',

            ...(options?.entityId !== undefined && {
                entityId: options.entityId,
            }),

            ...(options?.triggeredById !== undefined && {
                triggeredById: options.triggeredById,
            }),

            send: () => this.mailService.sendOrderProcessing(to, context),
        });
    }

    /**
     * Send order shipped email
     */
    async sendOrderShipped(
        to: string,
        context: OrderShippedTemplate,
        options?: {
            entityId?: string;
            triggeredById?: string;
        },
    ) {
        return this.executeEmail({
            to,
            subject: `Your order has been shipped #${context.orderNumber}`,
            body: `Order shipped #${context.orderNumber}`,
            entityType: 'Order',

            ...(options?.entityId !== undefined && {
                entityId: options.entityId,
            }),

            ...(options?.triggeredById !== undefined && {
                triggeredById: options.triggeredById,
            }),

            send: () => this.mailService.sendOrderShipped(to, context),
        });
    }

    /**
     * Send order delivered email
     */
    async sendOrderDelivered(
        to: string,
        context: OrderDeliveredTemplate,
        options?: {
            entityId?: string;
            triggeredById?: string;
        },
    ) {
        return this.executeEmail({
            to,
            subject: `Your order has been delivered #${context.orderNumber}`,
            body: `Order delivered #${context.orderNumber}`,
            entityType: 'Order',

            ...(options?.entityId !== undefined && {
                entityId: options.entityId,
            }),

            ...(options?.triggeredById !== undefined && {
                triggeredById: options.triggeredById,
            }),

            send: () => this.mailService.sendOrderDelivered(to, context),
        });
    }

    /**
     * Send order cancelled email
     */
    async sendOrderCancelled(
        to: string,
        context: OrderCancelledTemplate,
        options?: {
            entityId?: string;
            triggeredById?: string;
        },
    ) {
        return this.executeEmail({
            to,
            subject: `Order cancelled #${context.orderNumber}`,
            body: `Order cancelled #${context.orderNumber}`,
            entityType: 'Order',

            ...(options?.entityId !== undefined && {
                entityId: options.entityId,
            }),

            ...(options?.triggeredById !== undefined && {
                triggeredById: options.triggeredById,
            }),

            send: () => this.mailService.sendOrderCancelled(to, context),
        });
    }

    /**
     * Find email log by ID
     */
    async findById(id: string) {
        return this.prisma.emailLog.findUniqueOrThrow({
            where: {
                id,
            },
        });
    }
}

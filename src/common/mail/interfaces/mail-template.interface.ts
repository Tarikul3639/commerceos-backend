export interface BaseMailTemplate {
    name?: string;
    appName: string;
    year: number;
}

export interface VerifyEmailTemplate extends BaseMailTemplate {
    name: string;
    verificationUrl: string;
    expireIn: string;
}

export interface ResetPasswordTemplate extends BaseMailTemplate {
    name: string;
    resetPasswordUrl: string;
    expireIn: string;
}

export interface WelcomeTemplate extends BaseMailTemplate {
    name: string;
    loginUrl: string;
}

export interface NotificationTemplate extends BaseMailTemplate {
    name: string;
    title: string;
    message: string;
    actionText?: string;
    actionUrl?: string;
}

export interface NewOrderNotificationTemplate {
    appName: string;
    year: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    orderNumber: string;
    orderDate: string;
    paymentMethod: string;
    paymentStatus: string;
    total: string;
    orderUrl: string;
}

export interface OrderConfirmationTemplate extends BaseMailTemplate {
    customerName: string;
    orderNumber: string;
    orderDate: string;
    paymentMethod: string;
    paymentStatus: string;
    total: string;
    orderUrl: string;
}

export interface OrderProcessingTemplate extends BaseMailTemplate {
    customerName: string;
    orderNumber: string;
    orderUrl: string;
}

export interface OrderShippedTemplate extends BaseMailTemplate {
    customerName: string;
    orderNumber: string;
    orderUrl: string;
    trackingNumber?: string;
    courierName?: string;
    trackingUrl?: string;
}

export interface OrderDeliveredTemplate extends BaseMailTemplate {
    customerName: string;
    orderNumber: string;
    deliveredDate: string;
    orderUrl: string;
}

export interface OrderCancelledTemplate extends BaseMailTemplate {
    customerName: string;
    orderNumber: string;
    cancellationReason?: string;
    supportUrl: string;
}
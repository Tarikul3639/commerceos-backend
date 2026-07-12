export interface OrderCancelledContext {
  appName: string;
  customerName: string;
  orderNumber: string;
  cancellationReason?: string;
  supportUrl: string;
  year: number;
}
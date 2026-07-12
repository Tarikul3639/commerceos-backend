export interface NewOrderNotificationContext {
  appName: string;
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  total: string;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: string;
  orderUrl: string;
  year: number;
}
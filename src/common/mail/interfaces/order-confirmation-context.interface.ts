export interface OrderConfirmationContext {
  appName: string;
  customerName: string;
  orderNumber: string;
  orderDate: string;
  paymentMethod: string;
  paymentStatus: string;
  total: string;
  orderUrl: string;
}
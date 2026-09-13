import { StockMovementType } from '../../../../lib/prisma/client';

export interface CreateStockMovementParams {
    type: StockMovementType;
    quantity: number;
    previousQuantity: number;
    currentQuantity: number;
    reason?: string;
    variantId: string;
    warehouseId: string;
    userId: string;
}
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { DashboardQueryDto } from '../dto/requests/dashboard-query.dto';
import { StockSummaryResponseDto } from '../dto/responses/stock-summary-response.dto';

/*
 * SERVICE: GetStockSummaryService
 */

@Injectable()
export class GetStockSummaryService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(_query: DashboardQueryDto): Promise<StockSummaryResponseDto> {
        /*
         * Fetch active product inventory details
         */
        const products = await this.prisma.product.findMany({
            where: { deletedAt: null },
            select: { stock: true, purchasePrice: true },
        });

        /*
         * Aggregate total stock metrics and valuation
         */
        const totalStockQuantity = products.reduce(
            (sum, product) => sum + product.stock,
            0,
        );
        const totalStockValue = products.reduce(
            (sum, product) => sum + product.stock * Number(product.purchasePrice),
            0,
        );

        /*
         * Build and return stock summary payload
         */
        return {
            totalProducts: products.length,
            totalStockQuantity,
            totalStockValue: totalStockValue.toString(),
            lowStockCount: products.filter(
                (product) => product.stock > 0 && product.stock <= 5,
            ).length,
            outOfStockCount: products.filter((product) => product.stock === 0)
                .length,
        };
    }
}
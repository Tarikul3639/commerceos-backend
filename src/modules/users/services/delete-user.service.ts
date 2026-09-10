import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class DeleteUserService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(userId: string): Promise<void> {
        // First, we need to check if the user exists and if they have any relations in the database. If the user has relations, we will not delete the user but instead mark them as deleted by updating their status to 'DELETED' and setting the deletedAt timestamp. If the user has no relations, we can safely delete the user from the database.
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },

            select: {
                _count: {
                    select: {
                        refreshTokens: true,
                        passwordResetTokens: true,
                        emailVerificationTokens: true,

                        orders: true,
                        discounts: true,
                        stockMovements: true,
                        stockTransfers: true,
                        purchases: true,
                        payments: true,

                        createdOrderReturns: true,
                        approvedOrderReturns: true,

                        createdPurchaseReturns: true,
                        approvedPurchaseReturns: true,

                        activityLogs: true,
                        notifications: true,
                        triggeredEmails: true,
                    },
                },
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Check if the user has any relations
        const hasRelations = Object.values(user._count).some(
            (count) => count > 0,
        );

        /**
         * If the user has relations, we will not delete the user but instead mark them as deleted by updating their status to 'DELETED' and setting the deletedAt timestamp. This is to maintain referential integrity in the database and avoid orphaned records. If the user has no relations, we can safely delete the user from the database.
         */
        if (hasRelations) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { status: 'DELETED', deletedAt: new Date() },
            });

            return;
        }

        // If the user has no relations, we can safely delete the user from the database
        await this.prisma.user.delete({
            where: { id: userId },
        });
    }
}

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { ActivityModule } from '../../../infrastructure/database/generated/prisma/client.js';

import { CreateNotificationDto } from '../dto/requests/create-notification.dto.js';
import { NotificationResponseDto } from '../dto/responses/notification-response.dto.js';

@Injectable()
export class CreateNotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationResponseDto | null> {
    const { userId, title, message, type, link, entityType, entityId } =
      createNotificationDto;

    const preferenceCategory = this.getPreferenceCategory(entityType);

    if (preferenceCategory) {
      const preferences = await this.prisma.notificationPreferences.findUnique({
        where: {
          id: 'default',
        },
      });

      if (preferences && !preferences[preferenceCategory]) {
        return null;
      }
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        ...(type !== undefined && { type }),
        ...(link !== undefined && { link }),
        ...(entityType !== undefined && { entityType }),
        ...(entityId !== undefined && { entityId }),
      },
    });

    return notification;
  }

  private getPreferenceCategory(
    entityType?: ActivityModule,
  ):
    'ordersInApp' | 'returnsInApp' | 'inventoryInApp' | 'paymentsInApp' | null {
    switch (entityType) {
      case ActivityModule.ORDER:
        return 'ordersInApp';

      case ActivityModule.ORDER_RETURN:
      case ActivityModule.PURCHASE_RETURN:
        return 'returnsInApp';

      case ActivityModule.INVENTORY:
      case ActivityModule.STOCK_MOVEMENT:
        return 'inventoryInApp';

      case ActivityModule.PAYMENT:
        return 'paymentsInApp';

      default:
        return null;
    }
  }
}

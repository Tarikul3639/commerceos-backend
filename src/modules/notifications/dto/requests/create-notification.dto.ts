import {
  ActivityModule,
  NotificationType,
} from '../../../../infrastructure/database/generated/prisma/client.js';

export class CreateNotificationDto {
  userId!: string;
  title!: string;
  message!: string;
  type?: NotificationType;
  link?: string;
  entityType?: ActivityModule;
  entityId?: string;
}

import { ActivityModule, NotificationType } from '@/lib/prisma/client';

export class CreateNotificationDto {
  userId!: string;
  title!: string;
  message!: string;
  type?: NotificationType;
  link?: string;
  entityType?: ActivityModule;
  entityId?: string;
}

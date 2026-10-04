import { Module } from '@nestjs/common';

import { EmailLogService } from '@/modules/emails/services/email-log.service';

@Module({
  providers: [EmailLogService],
  exports: [EmailLogService],
})
export class EmailModule {}

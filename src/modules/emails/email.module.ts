import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module.js';
import { EmailController } from './controllers/email.controller.js';
import { EmailLogService } from './services/email-log.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [EmailController],
  providers: [EmailLogService],
})
export class EmailModule {}

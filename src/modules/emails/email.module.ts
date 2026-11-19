import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module.js';
import { EmailController } from './controllers/email.controller.js';
import { EmailLogService } from './services/email-log.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [EmailController],
  providers: [EmailLogService],
})
export class EmailModule {}

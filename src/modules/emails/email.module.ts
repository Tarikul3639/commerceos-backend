import { Module } from '@nestjs/common';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { EmailController } from './controllers/email.controller';
import { EmailLogService } from './services/email-log.service';

@Module({
  imports: [PrismaModule],
  controllers: [EmailController],
  providers: [EmailLogService],
})
export class EmailModule {}

import { Module } from '@nestjs/common';

import { PrismaModule } from '@/common/prisma/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { MailModule } from '@/common/mail/mail.module';

// Controller
import { UserController } from '@/modules/users/controllers/user.controller';

// Services
import { CreateUserService } from '@/modules/users/services/create-user.service';
import { GetUsersService } from '@/modules/users/services/get-users.service';
import { GetUserService } from '@/modules/users/services/get-user.service';
import { UpdateUserService } from '@/modules/users/services/update-user.service';
import { UpdateUserStatusService } from '@/modules/users/services/update-user-status.service';
import { DeleteUserService } from '@/modules/users/services/delete-user.service';
import { RestoreUserService } from '@/modules/users/services/restore-user.service';

@Module({
  imports: [PrismaModule, AuthModule, MailModule],

  controllers: [UserController],

  providers: [
    CreateUserService,
    GetUsersService,
    GetUserService,
    UpdateUserService,
    UpdateUserStatusService,
    DeleteUserService,
    RestoreUserService,
  ],

  exports: [],
})
export class UsersModule {}

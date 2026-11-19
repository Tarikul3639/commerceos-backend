import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../infrastructure/database/database.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { EmailModule } from '../../infrastructure/messaging/email/email.module.js';

// Controller
import { UserController } from './controllers/user.controller.js';

// Services
import { CreateUserService } from './services/create-user.service.js';
import { GetUsersService } from './services/get-users.service.js';
import { GetUserService } from './services/get-user.service.js';
import { UpdateUserService } from './services/update-user.service.js';
import { UpdateUserStatusService } from './services/update-user-status.service.js';
import { DeleteUserService } from './services/delete-user.service.js';
import { RestoreUserService } from './services/restore-user.service.js';

@Module({
  imports: [DatabaseModule, AuthModule, EmailModule],

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

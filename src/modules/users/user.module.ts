import { Module } from '@nestjs/common';

import { PrismaModule } from '../../common/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../../common/mail/mail.module';

// Controller
import { UserController } from './controllers/user.controller';

// Services
import { CreateUserService } from './services/create-user.service';
import { GetUsersService } from './services/get-users.service';
import { GetUserService } from './services/get-user.service';
import { UpdateUserService } from './services/update-user.service';
import { UpdateUserStatusService } from './services/update-user-status.service';
import { DeleteUserService } from './services/delete-user.service';
import { RestoreUserService } from './services/restore-user.service';

@Module({
    imports: [
        PrismaModule,
        AuthModule,
        MailModule,
    ],

    controllers: [
        UserController,
    ],

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
export class UsersModule { }
import { Module } from '@nestjs/common';

import { PrismaModule } from '../../common/prisma/prisma.module';

// Controller
import { UserController } from './controllers/user.controller';

// Services
import { CreateUserService } from './services/create-user.service';
import { GetUsersService } from './services/get-users.service';
import { GetUserService } from './services/get-user.service';
import { UpdateUserService } from './services/update-user.service';
import { UpdateUserStatusService } from './services/update-user-status.service';
import { UpdateUserRoleService } from './services/update-user-role.service';
import { DeleteUserService } from './services/delete-user.service';

@Module({
    imports: [
        PrismaModule,
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
        UpdateUserRoleService,
        DeleteUserService,
    ],

    exports: [],
})
export class UsersModule {}
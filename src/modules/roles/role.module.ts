import { Module } from '@nestjs/common';

import { PrismaModule } from '../../common/prisma/prisma.module';

// Controller
import { RoleController } from './controllers/role.controller';

// Services
import { CreateRoleService } from './services/create-role.service';
import { GetRolesService } from './services/get-roles.service';
import { GetRoleService } from './services/get-role.service';
import { UpdateRoleService } from './services/update-role.service';
import { AssignPermissionsService } from './services/assign-permissions.service';
import { DeleteRoleService } from './services/delete-role.service';

@Module({
    imports: [
        PrismaModule,
    ],

    controllers: [
        RoleController,
    ],

    providers: [
        CreateRoleService,
        GetRolesService,
        GetRoleService,
        UpdateRoleService,
        AssignPermissionsService,
        DeleteRoleService,
    ],

    exports: [],
})
export class RoleModule {}
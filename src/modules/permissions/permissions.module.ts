import { Module } from '@nestjs/common';

import { PermissionsController } from '@/modules/permissions/controllers/permissions.controller';

import { GetPermissionsService } from '@/modules/permissions/services/get-permissions.service';
import { GetRolesPermissionsService } from '@/modules/permissions/services/get-roles-permissions.service';
import { UpdateRolePermissionsService } from '@/modules/permissions/services/update-role-permissions.service';

@Module({
  controllers: [PermissionsController],
  providers: [
    GetPermissionsService,
    GetRolesPermissionsService,
    UpdateRolePermissionsService,
  ],
})
export class PermissionsModule {}

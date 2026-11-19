import { Module } from '@nestjs/common';

import { PermissionsController } from './controllers/permissions.controller.js';

import { GetPermissionsService } from './services/get-permissions.service.js';
import { GetRolesPermissionsService } from './services/get-roles-permissions.service.js';
import { UpdateRolePermissionsService } from './services/update-role-permissions.service.js';

@Module({
  controllers: [PermissionsController],
  providers: [
    GetPermissionsService,
    GetRolesPermissionsService,
    UpdateRolePermissionsService,
  ],
})
export class PermissionsModule {}

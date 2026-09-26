import { Module } from "@nestjs/common"

import { PermissionsController } from "./controllers/permissions.controller"
import { GetPermissionsService } from "./services/get-permissions.service"
import { UpdateRolePermissionsService } from "./services/update-role-permissions.service"

@Module({
  controllers: [PermissionsController],
  providers: [
    GetPermissionsService,
    UpdateRolePermissionsService,
  ],
})
export class PermissionsModule {}
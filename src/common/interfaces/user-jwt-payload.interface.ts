import { RoleName, PermissionName } from "../../lib/prisma/enums";

export interface UserJwtPayload {
    id: string;
    email: string;
    name: string;
    role: RoleName;
    permissions: PermissionName[];
}
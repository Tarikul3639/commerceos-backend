import { RoleName } from "../../lib/prisma/client";

export interface UserJwtPayload {
    id: string;
    email: string;
    role: RoleName;
}
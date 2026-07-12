import { RoleName } from "../../lib/prisma/client";

export interface JwtPayload {
    sub: string;
    email: string;
    role: RoleName;
}
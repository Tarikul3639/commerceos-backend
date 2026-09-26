import { Role } from "../../lib/prisma/enums";

export interface UserJwtPayload {
    id: string;
    email: string;
    name: string;
    role: Role;
}
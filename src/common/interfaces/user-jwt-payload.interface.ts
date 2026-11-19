import { Role } from '../../infrastructure/database/generated/prisma/enums.js';

export interface UserJwtPayload {
  id: string;
  email: string;
  name: string;
  role: Role;
  remember?: boolean;
}

import { Role } from '../../lib/prisma/enums.js';

export interface UserJwtPayload {
  id: string;
  email: string;
  name: string;
  role: Role;
  remember?: boolean;
}

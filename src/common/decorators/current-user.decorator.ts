import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { UserJwtPayload } from '../interfaces/user-jwt-payload.interface.js';

type UserRequest = Request & { user?: UserJwtPayload };

export const CurrentUser = createParamDecorator(
  (data: keyof UserJwtPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<UserRequest>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

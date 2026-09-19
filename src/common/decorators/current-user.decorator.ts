import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserJwtPayload } from '../interfaces/user-jwt-payload.interface';

export const CurrentUser = createParamDecorator(
    (data: keyof UserJwtPayload | undefined, context: ExecutionContext) => {
        // Get the request object from the execution context
        const request = context.switchToHttp().getRequest();
        // Get the user object from the request and cast it to CurrentUserPayload
        const user = request.user as UserJwtPayload;

        return data ? user?.[data] : user;
    },
);

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserPayload } from '../interfaces/current-user.interface';

export const CurrentUser = createParamDecorator(
    (data: keyof CurrentUserPayload | undefined, context: ExecutionContext) => {
        // Get the request object from the execution context
        const request = context.switchToHttp().getRequest();
        // Get the user object from the request and cast it to CurrentUserPayload
        const user = request.user as CurrentUserPayload;

        return data ? user?.[data] : user;
    },
);

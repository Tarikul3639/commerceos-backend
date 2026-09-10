import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentCustomerPayload } from '../interfaces/current-customer.interface';

export const CurrentCustomer = createParamDecorator(
    (data: keyof CurrentCustomerPayload | undefined, context: ExecutionContext) => {
        // Get the request object from the execution context
        const request = context.switchToHttp().getRequest();
        // Get the customer object from the request and cast it to CurrentCustomerPayload
        const customer = request.customer as CurrentCustomerPayload;

        return data ? customer?.[data] : customer;
    },
);
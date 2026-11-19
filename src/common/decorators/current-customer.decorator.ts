import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { CurrentCustomerPayload } from '../interfaces/current-customer.interface.js';

type CustomerRequest = Request & { user?: CurrentCustomerPayload };

export const CurrentCustomer = createParamDecorator(
  (
    data: keyof CurrentCustomerPayload | undefined,
    context: ExecutionContext,
  ) => {
    const request = context.switchToHttp().getRequest<CustomerRequest>();
    const customer = request.user;

    return data ? customer?.[data] : customer;
  },
);

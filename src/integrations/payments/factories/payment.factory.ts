import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentMethod } from '../../../lib/prisma/enums.js';
import { PaymentProvider } from '../interfaces/payment-provider.interface.js';

@Injectable()
export class PaymentProviderFactory {
  get(method: PaymentMethod): PaymentProvider {
    throw new BadRequestException(
      `No verified provider adapter is configured for ${method}`,
    );
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentMethod } from '@/lib/prisma/enums';
import { PaymentProvider } from '../interfaces/payment-provider.interface';

@Injectable()
export class PaymentProviderFactory {
  get(method: PaymentMethod): PaymentProvider {
    throw new BadRequestException(
      `No verified provider adapter is configured for ${method}`,
    );
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentProvider } from '../../../infrastructure/database/generated/prisma/enums.js';
import { PaymentStrategy } from './payment-strategy.interface.js';

@Injectable()
export class PaymentStrategyFactory {
  private readonly strategies = new Map<PaymentProvider, PaymentStrategy>();

  constructor(strategies: PaymentStrategy[]) {
    for (const strategy of strategies) {
      this.strategies.set(strategy.provider, strategy);
    }
  }

  get(provider: PaymentProvider): PaymentStrategy {
    const strategy = this.strategies.get(provider);

    if (!strategy) {
      throw new BadRequestException(
        `Payment provider "${provider}" is not supported.`,
      );
    }

    return strategy;
  }
}

import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { AuditContext } from './audit-context.interface';

@Injectable()
export class AuditContextService {
  private readonly store = new AsyncLocalStorage<AuditContext>();

  // Executes a callback within the provided audit context.
  run<T>(context: AuditContext, callback: () => T): T {
    return this.store.run(context, callback);
  }

  // Returns the audit context for the current asynchronous execution.
  get(): AuditContext | undefined {
    return this.store.getStore();
  }
}

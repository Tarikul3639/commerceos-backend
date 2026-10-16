import { Global, Module } from '@nestjs/common';

import { AuditContextInterceptor } from './audit-context.interceptor';
import { AuditContextService } from './audit-context.service';

@Global()
@Module({
  providers: [AuditContextService, AuditContextInterceptor],
  exports: [AuditContextService, AuditContextInterceptor],
})
export class AuditModule { }

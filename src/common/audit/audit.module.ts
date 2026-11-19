import { Global, Module } from '@nestjs/common';

import { AuditContextInterceptor } from './audit-context.interceptor.js';
import { AuditContextService } from './audit-context.service.js';

@Global()
@Module({
  providers: [AuditContextService, AuditContextInterceptor],
  exports: [AuditContextService, AuditContextInterceptor],
})
export class AuditModule {}

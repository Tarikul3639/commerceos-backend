import type { Request } from 'express';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { AuditContext } from './audit-context.interface.js';
import { AuditContextService } from './audit-context.service.js';

type AuditRequest = Request & { user?: { id?: string } };

@Injectable()
export class AuditContextInterceptor implements NestInterceptor {
  constructor(private readonly auditContextService: AuditContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuditRequest>();
    const auditContext: AuditContext = {
      userId: request.user?.id,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      method: request.method,
      url: request.originalUrl ?? request.url,
    };

    return new Observable((subscriber) =>
      this.auditContextService.run(auditContext, () =>
        next.handle().subscribe(subscriber),
      ),
    );
  }
}

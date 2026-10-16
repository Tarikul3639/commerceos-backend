import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { AuditContext } from './audit-context.interface';
import { AuditContextService } from './audit-context.service';

@Injectable()
export class AuditContextInterceptor implements NestInterceptor {
  constructor(
    private readonly auditContextService: AuditContextService,
  ) { }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    // Get the current HTTP request.
    const request = context.switchToHttp().getRequest();

    // Collect request metadata for auditing.
    const auditContext: AuditContext = {
      userId: request.user?.id,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      method: request.method,
      url: request.originalUrl ?? request.url,
    };

    // Run the request handler within the audit context.
    return new Observable((subscriber) =>
      this.auditContextService.run(auditContext, () =>
        next.handle().subscribe(subscriber),
      ),
    );
  }
}
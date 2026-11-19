import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Observable, timeout, catchError, throwError } from 'rxjs';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TimeoutInterceptor.name);

  constructor(private readonly configService: ConfigService) {}

  private get timeoutMs(): number {
    return this.configService.getOrThrow<number>('app.requestTimeoutMs');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();

    const { method, originalUrl } = request;

    return next.handle().pipe(
      (timeout({
        each: this.timeoutMs,
      }),
      catchError((error: unknown) => {
        if (error instanceof Error && error.name === 'TimeoutError') {
          this.logger.warn(
            `${method} ${originalUrl} -> Request timeout (${this.timeoutMs}ms)`,
          );

          return throwError(
            () =>
              new RequestTimeoutException(
                'Request processing timed out. Please try again later.',
              ),
          );
        }

        return throwError(() => error);
      })),
    );
  }
}

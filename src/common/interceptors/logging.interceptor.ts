import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    // const controller = context.getClass().name;
    // const handler = context.getHandler().name;

    const { method, originalUrl } = request;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startedAt;
        this.logger.log(
          `${method} ${originalUrl} ${response.statusCode} -> ${duration}ms`,
        );
      }),
      catchError((error: unknown) => {
        const duration = Date.now() - startedAt;

        const statusCode =
          error instanceof HttpException ? error.getStatus() : 500;

        this.logger.error(
          `${method} ${originalUrl} ${statusCode} - ${duration}ms`,
        );

        return throwError(() => error);
      }),
    );
  }
}

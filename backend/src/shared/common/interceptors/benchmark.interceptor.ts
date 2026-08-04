import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export class BenchmarkInterceptor implements NestInterceptor {
  private readonly logger = new Logger(BenchmarkInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = performance.now();

    const request = context.switchToHttp().getRequest<Request>();

    const method = request.method;

    const url = request.url;

    return next.handle().pipe(
      tap(() => {
        const durationTime = performance.now() - start;

        this.logger.log(` ${method} ${url} ${durationTime.toFixed(2)}ms`);
      }),
    );
  }
}

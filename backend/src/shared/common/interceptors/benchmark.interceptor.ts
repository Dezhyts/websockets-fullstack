import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Socket } from 'socket.io';

export class BenchmarkInterceptor implements NestInterceptor {
  private readonly logger = new Logger(BenchmarkInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    console.log('>>> INTERCEPTOR CALLED, type:', context.getType());
    const start = performance.now();

    const type = context.getType();
    let logMessage = '';

    if (type === 'http') {
      const request = context.switchToHttp().getRequest<Request>();

      const method = request.method;
      const url = request.url;

      logMessage = `HTTP: ${method} ${url}`;
    } else if (type === 'ws') {
      const client = context.switchToWs().getClient<Socket>();
      const handlerName = context.getHandler().name;

      logMessage = `WS EVENT: ${handlerName} ${client.id}`;
    }
    return next.handle().pipe(
      tap(() => {
        const durationTime = performance.now() - start;

        this.logger.log(`${logMessage} ${durationTime.toFixed(2)}ms`);
      }),
    );
  }
}

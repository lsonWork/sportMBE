import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Response } from 'express';

interface JsendResponse<T> {
  status: 'success' | 'fail' | 'error';
  statusCode: number;
  data: T;
}

@Injectable()
export class JsendInterceptor<T>
  implements NestInterceptor<T, JsendResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<JsendResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data: T) => {
        return {
          status: 'success' as const,
          statusCode: response.statusCode,
          data: data,
        };
      }),
      catchError((err) => {
        throw err;
      }),
    );
  }
}

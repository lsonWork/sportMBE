import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Xử lý lỗi validation của class-validator
    if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      // Nếu là lỗi validation, trả về 'fail' với các lỗi cụ thể
      response.status(status).json({
        status: 'fail',
        statusCode: status,
        data: exceptionResponse['message'],
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Xử lý các lỗi HTTP khác
    response.status(status).json({
      status: 'error',
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}

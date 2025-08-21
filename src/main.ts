import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JsendInterceptor } from './common/interceptors/jsend.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new JsendInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  await app.listen(process.env.API_PORT ?? 3000);
}
bootstrap();

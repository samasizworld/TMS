import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ exposedHeaders: ['x-count'] })
  await app.listen(6060);

}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Global prefix
  app.setGlobalPrefix('api');

  //Pipes Class-Validator

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      //transform: true,
    }),
  );

  //Swagger implementation
  const config = new DocumentBuilder()
    .setTitle('StackStep API')
    .setDescription('StackStep Endpoints')
    .setVersion('1.0')
    .addTag('Goals')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  //enable CORS
  app.enableCors();

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

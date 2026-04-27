import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfigService } from './@shared/config';
import { RequestIdMiddleware } from './@shared/middleware/request-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(AppConfigService);

  app.use(helmet());
  app.enableCors({ origin: configService.corsOrigin });

  const requestIdMiddleware = new RequestIdMiddleware();
  app.use(requestIdMiddleware.use.bind(requestIdMiddleware));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle(configService.swaggerTitle)
    .setDescription(configService.swaggerDescription)
    .setVersion(configService.swaggerVersion)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(configService.port);
  console.log(`Application running on port ${configService.port}`);
  console.log(`Swagger docs: http://localhost:${configService.port}/api/docs`);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Configuration CORS
  app.enableCors({
    origin: ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:8082', 'http://localhost:5001', 'http://185.97.146.99:5000', 'http://185.97.146.99:5001', 'https://site-info-xi.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const apiPrefix = configService.get<string>('API_PREFIX') || 'api';
  app.setGlobalPrefix(apiPrefix);

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Site Info API')
    .setDescription('API de gestion des sites, équipements et équipes de maintenance')
    .setVersion('1.0')
    .addTag('auth', 'Authentification et gestion des utilisateurs')
    .addTag('sites', 'Gestion des sites')
    .addTag('equipment', 'Gestion des équipements')
    .addTag('teams', 'Gestion des équipes')
    .addTag('departments', 'Gestion des départements')
    .addTag('specifications', 'Spécifications des équipements')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrez votre token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      displayRequestDuration: true,
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Site Info API Documentation',
  });

  const port = configService.get<number>('API_PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`Documentation Swagger disponible sur: http://localhost:${port}/docs`);
}
bootstrap();

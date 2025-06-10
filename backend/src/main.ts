import { config } from 'dotenv';

config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

// dotenv.config() is not needed since we already have import 'dotenv/config' at the top

async function bootstrap() {
  // Vérification des variables d'environnement critiques
  console.log('🔍 Vérification des variables d\'environnement...');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Défini' : '❌ Manquant');
  console.log('DATABASE_HOST:', process.env.DATABASE_HOST || '❌ Manquant');
  console.log('DATABASE_PORT:', process.env.DATABASE_PORT || '❌ Manquant');
  console.log('DATABASE_NAME:', process.env.DATABASE_NAME || '❌ Manquant');
  
  if (!process.env.JWT_SECRET) {
    throw new Error('❌ JWT_SECRET est requis dans le fichier .env');
  }

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: false,
    transformOptions: {
      enableImplicitConversion: true,
    },
    exceptionFactory: (errors) => {
      console.log('Erreurs de validation:', JSON.stringify(errors, null, 2));
      
return new Error('Validation failed: ' + JSON.stringify(errors));
    }
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

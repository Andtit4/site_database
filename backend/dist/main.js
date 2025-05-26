"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.enableCors({
        origin: ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:8082', 'http://localhost:5001', 'http://185.97.146.99:5000', 'http://185.97.146.99:5001', 'https://site-info-xi.vercel.app'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    const apiPrefix = configService.get('API_PREFIX') || 'api';
    app.setGlobalPrefix(apiPrefix);
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Site Info API')
        .setDescription('API de gestion des sites, équipements et équipes de maintenance')
        .setVersion('1.0')
        .addTag('auth', 'Authentification et gestion des utilisateurs')
        .addTag('sites', 'Gestion des sites')
        .addTag('equipment', 'Gestion des équipements')
        .addTag('teams', 'Gestion des équipes')
        .addTag('departments', 'Gestion des départements')
        .addTag('specifications', 'Spécifications des équipements')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrez votre token JWT',
        in: 'header',
    }, 'JWT-auth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document, {
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
    const port = configService.get('API_PORT') || 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
    console.log(`Documentation Swagger disponible sur: http://localhost:${port}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map
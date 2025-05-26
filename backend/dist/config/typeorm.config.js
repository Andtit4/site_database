"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeOrmConfig = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'site_info_db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: false,
    logging: true,
    charset: 'utf8mb4_unicode_ci',
    connectTimeout: 60000,
    acquireTimeout: 60000,
    extra: {
        connectionLimit: 20,
        maxIdle: 10,
        idleTimeout: 60000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 30000
    }
});
const typeOrmConfig = (configService) => ({
    type: 'mysql',
    host: configService.get('DATABASE_HOST', 'localhost'),
    port: parseInt(configService.get('DATABASE_PORT', '3306'), 10),
    username: configService.get('DATABASE_USERNAME', 'root'),
    password: configService.get('DATABASE_PASSWORD', ''),
    database: configService.get('DATABASE_NAME', 'site_info_db'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: false,
    logging: true,
    charset: 'utf8mb4_unicode_ci',
    connectTimeout: 60000,
    acquireTimeout: 60000,
    extra: {
        connectionLimit: 20,
        maxIdle: 10,
        idleTimeout: 60000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 30000
    }
});
exports.typeOrmConfig = typeOrmConfig;
//# sourceMappingURL=typeorm.config.js.map
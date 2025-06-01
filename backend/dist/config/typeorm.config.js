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
    database: process.env.DATABASE_NAME || 'u527740812_site_info_db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [],
    synchronize: true,
    logging: false,
    charset: 'utf8mb4_unicode_ci',
    connectTimeout: 20000,
    acquireTimeout: 20000,
    extra: {
        connectionLimit: 10,
        maxIdle: 5,
        idleTimeout: 30000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        reconnect: true,
        acquireTimeoutMillis: 20000,
        createTimeoutMillis: 20000,
        destroyTimeoutMillis: 5000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
    }
});
const typeOrmConfig = (configService) => ({
    type: 'mysql',
    host: configService.get('DATABASE_HOST', 'localhost'),
    port: parseInt(configService.get('DATABASE_PORT', '3306'), 10),
    username: configService.get('DATABASE_USERNAME', 'root'),
    password: configService.get('DATABASE_PASSWORD', ''),
    database: configService.get('DATABASE_NAME', 'u527740812_site_info_db'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [],
    synchronize: true,
    logging: configService.get('NODE_ENV') === 'development',
    charset: 'utf8mb4_unicode_ci',
    connectTimeout: 20000,
    acquireTimeout: 20000,
    extra: {
        connectionLimit: 10,
        maxIdle: 5,
        idleTimeout: 30000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        reconnect: true,
        acquireTimeoutMillis: 20000,
        createTimeoutMillis: 20000,
        destroyTimeoutMillis: 5000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
    }
});
exports.typeOrmConfig = typeOrmConfig;
//# sourceMappingURL=typeorm.config.js.map
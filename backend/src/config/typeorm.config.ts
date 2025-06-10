import type { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';
import type { ConfigService } from '@nestjs/config';

// Configuration de développement avec SQLite (si PostgreSQL n'est pas disponible)
const developmentConfig = (): DataSourceOptions => ({
  type: 'sqlite',
  database: ':memory:', // Base de données en mémoire pour les tests
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // Activé pour SQLite en développement
  logging: true,
});

// Configuration for PostgreSQL
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'site_info_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false, // Utiliser les migrations
  logging: false,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectTimeoutMS: 20000,
  extra: {
    max: 10, // Taille maximale du pool de connexions
  }
});

// Configuration function for NestJS
export const typeOrmConfig = (configService: ConfigService): DataSourceOptions => {
  // Si on est en mode développement et que USE_SQLITE est défini, utiliser SQLite
  if (configService.get('NODE_ENV') === 'development' && configService.get('USE_SQLITE') === 'true') {
    console.log('🐾 Mode développement SQLite activé');
    
return developmentConfig();
  }

  // Sinon, utiliser PostgreSQL
  return {
    type: 'postgres',
    host: configService.get('DATABASE_HOST', 'localhost'),
    port: parseInt(configService.get('DATABASE_PORT', '5432'), 10),
    username: configService.get('DATABASE_USERNAME', 'postgres'),
    password: configService.get('DATABASE_PASSWORD', ''),
    database: configService.get('DATABASE_NAME', 'site_info_db'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: false, // Utiliser les migrations au lieu de la synchronisation
    logging: configService.get('NODE_ENV') === 'development',
    ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
    connectTimeoutMS: 20000,
    extra: {
      max: 10, // Taille maximale du pool de connexions
    }
  };
}; 

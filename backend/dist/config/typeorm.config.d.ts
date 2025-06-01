import type { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';
import type { ConfigService } from '@nestjs/config';
export declare const AppDataSource: DataSource;
export declare const typeOrmConfig: (configService: ConfigService) => DataSourceOptions;

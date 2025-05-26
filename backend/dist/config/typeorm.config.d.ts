import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
export declare const AppDataSource: DataSource;
export declare const typeOrmConfig: (configService: ConfigService) => DataSourceOptions;

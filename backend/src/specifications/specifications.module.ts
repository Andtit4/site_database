import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SpecificationsController } from './specifications.controller';
import { SpecificationsService } from './specifications.service';
import { Specification } from './entities/specification.entity';
import { TableManagerModule } from '../table-manager/table-manager.module';
import { typeOrmConfig } from '../config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => typeOrmConfig(configService)
    }),
    TypeOrmModule.forFeature([Specification]),
    TableManagerModule
  ],
  controllers: [SpecificationsController],
  providers: [SpecificationsService],
  exports: [SpecificationsService]
})
export class SpecificationsModule {} 
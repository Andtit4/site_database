import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SiteSpecificationsController } from './site-specifications.controller';
import { SiteSpecificationsService } from './site-specifications.service';
import { SiteSpecification } from './entities/site-specification.entity';
import { TableManagerModule } from '../table-manager/table-manager.module';
import { typeOrmConfig } from '../config/typeorm.config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([SiteSpecification]),
    TableManagerModule,
    AuthModule
  ],
  controllers: [SiteSpecificationsController],
  providers: [SiteSpecificationsService],
  exports: [SiteSpecificationsService]
})
export class SiteSpecificationsModule {} 

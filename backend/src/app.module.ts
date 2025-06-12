import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { SitesModule } from './sites/sites.module';
import { SiteCustomFieldsModule } from './site-custom-fields/site-custom-fields.module';
import { EquipmentModule } from './equipment/equipment.module';
import { TeamsModule } from './teams/teams.module';
import { DepartmentsModule } from './departments/departments.module';
import { SpecificationsModule } from './specifications/specifications.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SiteSpecificationsModule } from './site-specifications/site-specifications.module';
import { typeOrmConfig } from './config/typeorm.config';
import { TableManagerModule } from './table-manager/table-manager.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...typeOrmConfig(configService),
        autoLoadEntities: true,
        keepConnectionAlive: true,
        retryAttempts: 10,
        retryDelay: 3000,
      })
    }),
    SitesModule,
    SiteCustomFieldsModule,
    EquipmentModule,
    TeamsModule,
    DepartmentsModule,
    SpecificationsModule,
    SiteSpecificationsModule,
    AuthModule,
    UsersModule,
    TableManagerModule,
    NotificationsModule
  ],
  controllers: [HealthController],
  providers: [AppService],
})
export class AppModule {} 

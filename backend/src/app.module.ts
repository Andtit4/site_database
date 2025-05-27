import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SitesModule } from './sites/sites.module';
import { EquipmentModule } from './equipment/equipment.module';
import { TeamsModule } from './teams/teams.module';
import { DepartmentsModule } from './departments/departments.module';
import { SpecificationsModule } from './specifications/specifications.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { typeOrmConfig } from './config/typeorm.config';
import { SiteSpecificationsModule } from './site-specifications/site-specifications.module';
import { TableManagerModule } from './table-manager/table-manager.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => typeOrmConfig(configService)
    }),
    SitesModule,
    EquipmentModule,
    TeamsModule,
    DepartmentsModule,
    SpecificationsModule,
    AuthModule,
    UsersModule,
    SiteSpecificationsModule,
    TableManagerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 

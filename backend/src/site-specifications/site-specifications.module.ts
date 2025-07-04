import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SiteSpecificationsController } from './site-specifications.controller';
import { SiteSpecificationsService } from './site-specifications.service';
import { SiteSpecification } from './entities/site-specification.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SiteSpecification]),
    AuthModule
  ],
  controllers: [SiteSpecificationsController],
  providers: [SiteSpecificationsService],
  exports: [SiteSpecificationsService]
})
export class SiteSpecificationsModule {} 

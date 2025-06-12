import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteCustomField } from '../entities/site-custom-field.entity';
import { SiteCustomFieldBackup } from '../entities/site-custom-field-backup.entity';
import { Site } from '../entities/site.entity';
import { SiteCustomFieldsService } from './site-custom-fields.service';
import { SiteCustomFieldsController } from './site-custom-fields.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SiteCustomField, SiteCustomFieldBackup, Site])],
  controllers: [SiteCustomFieldsController],
  providers: [SiteCustomFieldsService],
  exports: [SiteCustomFieldsService]
})
export class SiteCustomFieldsModule {} 

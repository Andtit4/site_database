import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';
import { Site } from '../entities/site.entity';
import { Equipment } from '../entities/equipment.entity';
import { Team } from '../teams/entities/team.entity';
import { SiteCustomFieldsService } from '../site-custom-fields/site-custom-fields.service';
import { SiteCustomField } from '../entities/site-custom-field.entity';
import { SiteCustomFieldBackup } from '../entities/site-custom-field-backup.entity';
import { Department } from '../entities/department.entity';
// import { SiteDynamicFieldsController } from './site-dynamic-fields.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Site, Equipment, Team, SiteCustomField, SiteCustomFieldBackup, Department])],
      controllers: [SitesController],
      providers: [SitesService, SiteCustomFieldsService],
      exports: [SitesService, SiteCustomFieldsService],
})
export class SitesModule {} 

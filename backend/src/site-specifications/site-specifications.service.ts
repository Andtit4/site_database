import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSpecification } from './entities/site-specification.entity';
import { CreateSiteSpecificationDto } from './dto/create-site-specification.dto';
import { UpdateSiteSpecificationDto } from './dto/update-site-specification.dto';
import { TableManagerService, TableDefinition } from '../table-manager/table-manager.service';

@Injectable()
export class SiteSpecificationsService {
  constructor(
    @InjectRepository(SiteSpecification)
    private siteSpecificationRepository: Repository<SiteSpecification>,
    private tableManagerService: TableManagerService,
  ) {}

  async findAll(): Promise<SiteSpecification[]> {
    return this.siteSpecificationRepository.find();
  }

  async findByType(siteType: string): Promise<SiteSpecification[]> {
    return this.siteSpecificationRepository.find({
      where: { siteType }
    });
  }

  async findOne(id: string): Promise<SiteSpecification> {
    const specification = await this.siteSpecificationRepository.findOne({
      where: { id }
    });

    if (!specification) {
      throw new NotFoundException(`Spécification de site avec l'ID ${id} non trouvée`);
    }

    return specification;
  }

  async create(createSiteSpecificationDto: CreateSiteSpecificationDto): Promise<SiteSpecification> {
    const specification = this.siteSpecificationRepository.create({
      siteType: createSiteSpecificationDto.siteType,
      columns: createSiteSpecificationDto.columns
    });

    const savedSpecification = await this.siteSpecificationRepository.save(specification);
    
    // Créer la table correspondante
    const tableDefinition: TableDefinition = {
      tableName: `site_spec_${savedSpecification.siteType.toLowerCase()}`,
      columns: savedSpecification.columns
    };
    
    await this.tableManagerService.createTable(tableDefinition);

    return savedSpecification;
  }

  async update(id: string, updateSiteSpecificationDto: UpdateSiteSpecificationDto): Promise<SiteSpecification> {
    const specification = await this.findOne(id);
    
    const updatedSpecification = this.siteSpecificationRepository.merge(specification, updateSiteSpecificationDto);

    const savedSpecification = await this.siteSpecificationRepository.save(updatedSpecification);

    // Recréer la table avec les nouvelles spécifications
    const tableDefinition: TableDefinition = {
      tableName: `site_spec_${savedSpecification.siteType.toLowerCase()}`,
      columns: savedSpecification.columns
    };
    
    await this.tableManagerService.createTable(tableDefinition);

    return savedSpecification;
  }

  async remove(id: string): Promise<void> {
    const specification = await this.findOne(id);
    
    // Supprimer d'abord la table
    await this.tableManagerService.dropTable(`site_spec_${specification.siteType.toLowerCase()}`);
    
    // Puis supprimer l'enregistrement
    await this.siteSpecificationRepository.remove(specification);
  }
} 

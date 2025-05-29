import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSpecification } from './entities/site-specification.entity';
import { CreateSiteSpecificationDto } from './dto/create-site-specification.dto';
import { UpdateSiteSpecificationDto } from './dto/update-site-specification.dto';
import { TableManagerService, TableDefinition } from '../table-manager/table-manager.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SiteSpecificationsService {
  constructor(
    @InjectRepository(SiteSpecification)
    private siteSpecificationRepository: Repository<SiteSpecification>,
    private tableManagerService: TableManagerService,
  ) {}

  // Fonction utilitaire pour générer un nom de table à partir du type de site
  private getTableNameFromSiteType(siteType: string): string {
    return `site_spec_${siteType.toLowerCase()}`;
  }

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

  async create(dto: any): Promise<SiteSpecification> {
    console.log('DTO reçu dans le service:', dto);
    
    try {
      // Vérification des données
      if (!dto || typeof dto !== 'object') {
        throw new Error('DTO invalide reçu par le service');
      }
      
      if (!dto.siteType) {
        throw new Error('Le type de site est requis');
      }
      
      if (!dto.columns || !Array.isArray(dto.columns)) {
        throw new Error('Les colonnes sont requises et doivent être un tableau');
      }
      
      // Génération d'un ID UUID
      const id = uuidv4();
      
      // Conversion des colonnes en JSON
      const columnsJson = JSON.stringify(dto.columns);
      
      console.log('Valeurs à insérer:', {
        id,
        siteType: dto.siteType,
        columns: columnsJson
      });
      
      // Exécution d'une requête SQL directe
      await this.siteSpecificationRepository.query(
        `INSERT INTO site_specifications (id, siteType, columns) 
         VALUES (?, ?, ?)`,
        [id, dto.siteType, columnsJson]
      );
      
      // Récupération de l'entité créée
      const savedSpecification = await this.siteSpecificationRepository.findOne({
        where: { id }
      });
      
      if (!savedSpecification) {
        throw new Error('Échec de la création de la spécification de site');
      }
      
      // Créer la table correspondante
      const tableDefinition: TableDefinition = {
        tableName: this.getTableNameFromSiteType(savedSpecification.siteType),
        columns: savedSpecification.columns
      };
      
      await this.tableManagerService.createTable(tableDefinition);
  
      return savedSpecification;
    } catch (error) {
      console.error('Erreur lors de la création de la spécification:', error);
      throw new Error(`Impossible de créer la spécification: ${error.message}`);
    }
  }

  async update(id: string, updateSiteSpecificationDto: UpdateSiteSpecificationDto): Promise<SiteSpecification> {
    const specification = await this.findOne(id);
    
    // Mettre à jour l'objet spécification
    const updatedSpecification = this.siteSpecificationRepository.merge(specification, updateSiteSpecificationDto);
    const savedSpecification = await this.siteSpecificationRepository.save(updatedSpecification);

    // Recréer la table avec les nouvelles spécifications
    const tableDefinition: TableDefinition = {
      tableName: this.getTableNameFromSiteType(savedSpecification.siteType),
      columns: savedSpecification.columns
    };
    
    await this.tableManagerService.createTable(tableDefinition);

    return savedSpecification;
  }

  async remove(id: string): Promise<void> {
    const specification = await this.findOne(id);
    
    // Supprimer d'abord la table
    await this.tableManagerService.dropTable(this.getTableNameFromSiteType(specification.siteType));
    
    // Puis supprimer l'enregistrement
    await this.siteSpecificationRepository.remove(specification);
  }

  async checkTableStructure(): Promise<any> {
    try {
      // Vérifier la structure de la table
      const tableInfo = await this.siteSpecificationRepository.query(
        `DESCRIBE site_specifications`
      );
      
      // Vérifier les contraintes
      const constraintInfo = await this.siteSpecificationRepository.query(
        `SELECT * FROM information_schema.TABLE_CONSTRAINTS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'site_specifications'`
      );
      
      // Récupérer les informations sur les colonnes
      const columnInfo = await this.siteSpecificationRepository.query(
        `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA 
         FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'site_specifications'`
      );
      
      return {
        tableStructure: tableInfo,
        constraints: constraintInfo,
        columns: columnInfo
      };
    } catch (error) {
      console.error('Erreur lors de la vérification de la structure de la table:', error);
      throw new Error(`Impossible de vérifier la structure: ${error.message}`);
    }
  }
} 

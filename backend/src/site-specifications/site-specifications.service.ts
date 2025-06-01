import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { SiteSpecification } from './entities/site-specification.entity';
import type { UpdateSiteSpecificationDto } from './dto/update-site-specification.dto';

@Injectable()
export class SiteSpecificationsService {
  constructor(
    @InjectRepository(SiteSpecification)
    private siteSpecificationRepository: Repository<SiteSpecification>,
  ) {}

  // Fonction utilitaire pour générer un nom de table à partir du type de site
  private getTableNameFromSiteType(siteType: string): string {
    return `site_spec_${siteType.toLowerCase()}`;
  }

  async findAll(): Promise<SiteSpecification[]> {
    try {
      const specifications = await this.siteSpecificationRepository.find();

      
return specifications;
    } catch (error) {
      console.error('Erreur lors de la récupération des spécifications:', error);
      throw error;
    }
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
      
      // Utilisation de l'ORM TypeORM
      const specification = this.siteSpecificationRepository.create({
        siteType: dto.siteType,
        columns: dto.columns
      });
      
      // Sauvegarde avec l'ORM
      const savedSpecification = await this.siteSpecificationRepository.save(specification);
      
      if (!savedSpecification) {
        throw new Error('Échec de la création de la spécification de site');
      }
    
      // TODO: Créer la table correspondante plus tard
      console.log(`Table ${this.getTableNameFromSiteType(savedSpecification.siteType)} devrait être créée`);

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

    // TODO: Recréer la table avec les nouvelles spécifications plus tard
    console.log(`Table ${this.getTableNameFromSiteType(savedSpecification.siteType)} devrait être mise à jour`);

    return savedSpecification;
  }

  async remove(id: string): Promise<void> {
    const specification = await this.findOne(id);
    
    // TODO: Supprimer la table plus tard
    console.log(`Table ${this.getTableNameFromSiteType(specification.siteType)} devrait être supprimée`);
    
    // Supprimer l'enregistrement
    await this.siteSpecificationRepository.remove(specification);
  }

  async debugRawData(): Promise<any> {
    try {
      // Requête SQL brute pour voir exactement ce qui est stocké
      const rawData = await this.siteSpecificationRepository.query(
        'SELECT id, siteType, columns, createdAt, updatedAt FROM site_specifications'
      );
      
      // Vérification avec l'ORM
      const ormData = await this.siteSpecificationRepository.find();
      
      // Comparaison des données
      const comparison = rawData.map((raw, index) => {
        const orm = ormData[index];

        
return {
          rawId: raw.id,
          rawSiteType: raw.siteType,
          rawSiteTypeType: typeof raw.siteType,
          rawSiteTypeLength: raw.siteType?.length,
          ormId: orm?.id,
          ormSiteType: orm?.siteType,
          ormSiteTypeType: typeof orm?.siteType,
          ormSiteTypeLength: orm?.siteType?.length,
          match: raw.siteType === orm?.siteType
        };
      });
      
      return {
        rawData,
        ormData,
        comparison,
        tableStructure: await this.siteSpecificationRepository.query('DESCRIBE site_specifications')
      };
    } catch (error) {
      console.error('Erreur lors du debug:', error);
      throw new Error(`Erreur debug: ${error.message}`);
    }
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

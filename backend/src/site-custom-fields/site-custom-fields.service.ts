import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { SiteCustomField, CustomFieldType } from '../entities/site-custom-field.entity';
import { SiteCustomFieldBackup, BackupAction } from '../entities/site-custom-field-backup.entity';
import { Site } from '../entities/site.entity';

export interface CreateCustomFieldDto {
  fieldName: string;
  fieldLabel: string;
  fieldType: CustomFieldType;
  required?: boolean;
  defaultValue?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  description?: string;
  sortOrder?: number;
}

export interface UpdateCustomFieldDto {
  fieldLabel?: string;
  fieldType?: CustomFieldType;
  required?: boolean;
  defaultValue?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  description?: string;
  sortOrder?: number;
  active?: boolean;
}

export interface CreateBackupDto {
  timestamp: Date;
  action: BackupAction;
  fieldData: SiteCustomField;
  affectedSitesCount?: number;
  reason?: string;
}

export interface FieldAnalysisResult {
  affectedSitesCount: number;
  warnings: string[];
  hasData: boolean;
  affectedSitesData?: Record<string, any>;
}

@Injectable()
export class SiteCustomFieldsService {
  constructor(
    @InjectRepository(SiteCustomField)
    private customFieldRepository: Repository<SiteCustomField>,
    @InjectRepository(SiteCustomFieldBackup)
    private backupRepository: Repository<SiteCustomFieldBackup>,
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
  ) {}

  async findAll(): Promise<SiteCustomField[]> {
    return this.customFieldRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'ASC' }
    });
  }

  async findActive(): Promise<SiteCustomField[]> {
    return this.customFieldRepository.find({
      where: { active: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' }
    });
  }

  async findOne(id: string): Promise<SiteCustomField> {
    const field = await this.customFieldRepository.findOne({ where: { id } });
    if (!field) {
      throw new NotFoundException(`Champ personnalisé avec ID ${id} non trouvé`);
    }
    return field;
  }

  async create(createDto: CreateCustomFieldDto): Promise<SiteCustomField> {
    // Vérifier que le nom de champ n'existe pas déjà
    const existingField = await this.customFieldRepository.findOne({
      where: { fieldName: createDto.fieldName }
    });

    if (existingField) {
      throw new ConflictException(`Un champ avec le nom "${createDto.fieldName}" existe déjà`);
    }

    // Valider les options pour les champs SELECT
    if (createDto.fieldType === CustomFieldType.SELECT && (!createDto.options || createDto.options.length === 0)) {
      throw new BadRequestException('Les champs de type SELECT doivent avoir au moins une option');
    }

    const field = this.customFieldRepository.create(createDto);
    return this.customFieldRepository.save(field);
  }

  async update(id: string, updateDto: UpdateCustomFieldDto): Promise<SiteCustomField> {
    const field = await this.findOne(id);

    // Valider les options pour les champs SELECT
    if (updateDto.fieldType === CustomFieldType.SELECT && (!updateDto.options || updateDto.options.length === 0)) {
      throw new BadRequestException('Les champs de type SELECT doivent avoir au moins une option');
    }

    Object.assign(field, updateDto);
    return this.customFieldRepository.save(field);
  }

  async remove(id: string): Promise<void> {
    const field = await this.findOne(id);
    await this.customFieldRepository.remove(field);
  }

  async toggleActive(id: string): Promise<SiteCustomField> {
    const field = await this.findOne(id);
    field.active = !field.active;
    return this.customFieldRepository.save(field);
  }

  async updateSortOrder(fieldIds: string[]): Promise<void> {
    for (let i = 0; i < fieldIds.length; i++) {
      await this.customFieldRepository.update(fieldIds[i], { sortOrder: i });
    }
  }

  // ===== NOUVELLES MÉTHODES POUR L'ANALYSE ET LA SÉCURITÉ =====

  /**
   * Analyse l'impact de la suppression d'un champ personnalisé
   */
  async analyzeFieldDeletion(fieldId: string): Promise<FieldAnalysisResult> {
    const field = await this.findOne(fieldId);
    
    // Rechercher tous les sites qui ont des données pour ce champ
    const sites = await this.siteRepository
      .createQueryBuilder('site')
      .where(`site."customFieldsValues" ? :fieldName`, { fieldName: field.fieldName })
      .andWhere(`site."customFieldsValues"->>:fieldName IS NOT NULL`, { fieldName: field.fieldName })
      .andWhere(`site."customFieldsValues"->>:fieldName != ''`, { fieldName: field.fieldName })
      .getMany();

    const warnings: string[] = [];
    const affectedSitesData: Record<string, any> = {};

    if (sites.length > 0) {
      warnings.push(`${sites.length} site(s) contiennent des données pour ce champ`);
      
      // Analyser les types de données qui seront perdues
      const dataTypes = new Set<string>();
      sites.forEach(site => {
        const value = site.customFieldsValues?.[field.fieldName];
        if (value !== null && value !== undefined && value !== '') {
          affectedSitesData[site.id] = {
            siteName: site.name,
            fieldValue: value,
            siteId: site.id
          };
          
          if (typeof value === 'string' && value.length > 50) {
            dataTypes.add('texte long');
          } else if (typeof value === 'number') {
            dataTypes.add('données numériques');
          } else if (typeof value === 'boolean') {
            dataTypes.add('données oui/non');
          } else {
            dataTypes.add('données texte');
          }
        }
      });

      if (dataTypes.size > 0) {
        warnings.push(`Types de données qui seront perdues: ${Array.from(dataTypes).join(', ')}`);
      }

      // Avertissement spécial pour les champs requis
      if (field.required) {
        warnings.push('⚠️ Ce champ est marqué comme REQUIS - sa suppression peut causer des erreurs de validation');
      }

      // Avertissement pour les champs avec des contraintes de validation
      if (field.validation && Object.keys(field.validation).length > 0) {
        warnings.push('Ce champ a des règles de validation personnalisées qui seront perdues');
      }
    }

    return {
      affectedSitesCount: sites.length,
      warnings,
      hasData: sites.length > 0,
      affectedSitesData
    };
  }

  /**
   * Analyse l'impact de la modification d'un champ personnalisé
   */
  async analyzeFieldModification(fieldId: string, updateDto: UpdateCustomFieldDto): Promise<FieldAnalysisResult> {
    const field = await this.findOne(fieldId);
    const warnings: string[] = [];

    // Rechercher les sites avec des données pour ce champ
    const sites = await this.siteRepository
      .createQueryBuilder('site')
      .where(`site."customFieldsValues" ? :fieldName`, { fieldName: field.fieldName })
      .andWhere(`site."customFieldsValues"->>:fieldName IS NOT NULL`, { fieldName: field.fieldName })
      .andWhere(`site."customFieldsValues"->>:fieldName != ''`, { fieldName: field.fieldName })
      .getMany();

    // Analyser les changements de type
    if (updateDto.fieldType && updateDto.fieldType !== field.fieldType) {
      warnings.push(`Changement de type: ${field.fieldType} → ${updateDto.fieldType}`);
      
      // Vérifications spécifiques selon le type
      if (field.fieldType === CustomFieldType.NUMBER && updateDto.fieldType !== CustomFieldType.NUMBER) {
        warnings.push('Les données numériques existantes pourraient ne plus être valides');
      }
      
      if (field.fieldType === CustomFieldType.BOOLEAN && updateDto.fieldType !== CustomFieldType.BOOLEAN) {
        warnings.push('Les valeurs Oui/Non existantes seront converties en texte');
      }
      
      if (field.fieldType === CustomFieldType.SELECT && updateDto.fieldType !== CustomFieldType.SELECT) {
        warnings.push('Les options de liste déroulante seront perdues');
      }
      
      if (updateDto.fieldType === CustomFieldType.SELECT && field.fieldType !== CustomFieldType.SELECT) {
        warnings.push('Les valeurs existantes pourraient ne pas correspondre aux nouvelles options');
      }
    }

    // Analyser les changements de validation
    if (updateDto.validation) {
      if (updateDto.validation.min !== undefined && field.validation?.min !== updateDto.validation.min) {
        warnings.push(`Nouvelle valeur minimale: ${updateDto.validation.min}`);
      }
      if (updateDto.validation.max !== undefined && field.validation?.max !== updateDto.validation.max) {
        warnings.push(`Nouvelle valeur maximale: ${updateDto.validation.max}`);
      }
      if (updateDto.validation.minLength !== undefined && field.validation?.minLength !== updateDto.validation.minLength) {
        warnings.push(`Nouvelle longueur minimale: ${updateDto.validation.minLength}`);
      }
      if (updateDto.validation.maxLength !== undefined && field.validation?.maxLength !== updateDto.validation.maxLength) {
        warnings.push(`Nouvelle longueur maximale: ${updateDto.validation.maxLength}`);
      }
    }

    // Analyser le changement de statut requis
    if (updateDto.required !== undefined && updateDto.required !== field.required) {
      if (updateDto.required) {
        warnings.push('Le champ deviendra REQUIS - les sites sans valeur pour ce champ pourraient avoir des erreurs');
      } else {
        warnings.push('Le champ ne sera plus requis');
      }
    }

    // Analyser les changements d'options pour les champs SELECT
    if (updateDto.options && field.fieldType === CustomFieldType.SELECT) {
      const currentOptions = field.options || [];
      const newOptions = updateDto.options;
      
      const removedOptions = currentOptions.filter(opt => !newOptions.includes(opt));
      if (removedOptions.length > 0) {
        warnings.push(`Options supprimées: ${removedOptions.join(', ')}`);
        warnings.push('Les sites utilisant ces options pourraient avoir des valeurs invalides');
      }
    }

    return {
      affectedSitesCount: sites.length,
      warnings,
      hasData: sites.length > 0
    };
  }

  // ===== GESTION DES SAUVEGARDES =====

  /**
   * Créer une sauvegarde d'un champ personnalisé
   */
  async createBackup(createBackupDto: CreateBackupDto): Promise<SiteCustomFieldBackup> {
    // Obtenir les données des sites affectés pour une restauration complète
    const analysisResult = await this.analyzeFieldDeletion(createBackupDto.fieldData.id);
    
    const backup = this.backupRepository.create({
      ...createBackupDto,
      affectedSitesData: analysisResult.affectedSitesData
    });

    return this.backupRepository.save(backup);
  }

  /**
   * Récupérer toutes les sauvegardes (admin uniquement)
   */
  async getAllBackups(): Promise<SiteCustomFieldBackup[]> {
    return this.backupRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Récupérer une sauvegarde par ID
   */
  async getBackupById(id: string): Promise<SiteCustomFieldBackup> {
    const backup = await this.backupRepository.findOne({ where: { id } });
    if (!backup) {
      throw new NotFoundException(`Sauvegarde avec ID ${id} non trouvée`);
    }
    return backup;
  }

  /**
   * Restaurer un champ depuis une sauvegarde (admin uniquement)
   */
  async restoreFromBackup(backupId: string): Promise<SiteCustomField> {
    const backup = await this.getBackupById(backupId);
    
    // Vérifier si le champ existe déjà
    const existingField = await this.customFieldRepository.findOne({
      where: { fieldName: backup.fieldData.fieldName }
    });

    let restoredField: SiteCustomField;

    if (existingField) {
      // Mettre à jour le champ existant avec les données de la sauvegarde
      Object.assign(existingField, {
        fieldLabel: backup.fieldData.fieldLabel,
        fieldType: backup.fieldData.fieldType,
        required: backup.fieldData.required,
        defaultValue: backup.fieldData.defaultValue,
        options: backup.fieldData.options,
        validation: backup.fieldData.validation,
        description: backup.fieldData.description,
        active: backup.fieldData.active,
        sortOrder: backup.fieldData.sortOrder
      });
      restoredField = await this.customFieldRepository.save(existingField);
    } else {
      // Créer un nouveau champ avec les données de la sauvegarde
      const { id, createdAt, updatedAt, ...fieldDataWithoutDates } = backup.fieldData;
      restoredField = this.customFieldRepository.create(fieldDataWithoutDates);
      restoredField = await this.customFieldRepository.save(restoredField);
    }

    // Restaurer les données des sites si disponibles
    if (backup.affectedSitesData && Object.keys(backup.affectedSitesData).length > 0) {
      for (const [siteId, siteData] of Object.entries(backup.affectedSitesData)) {
        const site = await this.siteRepository.findOne({ where: { id: siteId } });
        if (site) {
          const customFieldsValues = site.customFieldsValues || {};
          customFieldsValues[backup.fieldData.fieldName] = siteData.fieldValue;
          site.customFieldsValues = customFieldsValues;
          await this.siteRepository.save(site);
        }
      }
    }

    // Marquer la sauvegarde comme restaurée
    backup.isRestored = true;
    await this.backupRepository.save(backup);

    return restoredField;
  }

  /**
   * Supprimer une sauvegarde (admin uniquement)
   */
  async deleteBackup(id: string): Promise<void> {
    const backup = await this.getBackupById(id);
    await this.backupRepository.remove(backup);
  }

  /**
   * Nettoyer les anciennes sauvegardes (admin uniquement)
   */
  async cleanOldBackups(olderThanDays: number = 90): Promise<{ deletedCount: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.backupRepository.delete({
      createdAt: LessThan(cutoffDate)
    });

    return { deletedCount: result.affected || 0 };
  }

  /**
   * Valide les valeurs personnalisées selon les définitions de champs
   */
  async validateCustomValues(values: Record<string, any>): Promise<{ isValid: boolean; errors: string[] }> {
    const fields = await this.findActive();
    const errors: string[] = [];

    for (const field of fields) {
      const value = values[field.fieldName];

      // Vérifier les champs requis
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push(`Le champ "${field.fieldLabel}" est requis`);
        continue;
      }

      // Si le champ n'est pas requis et vide, on continue
      if (value === undefined || value === null || value === '') {
        continue;
      }

      // Validation par type
      switch (field.fieldType) {
        case CustomFieldType.NUMBER:
          if (isNaN(Number(value))) {
            errors.push(`Le champ "${field.fieldLabel}" doit être un nombre`);
          } else {
            const numValue = Number(value);
            if (field.validation?.min !== undefined && numValue < field.validation.min) {
              errors.push(`Le champ "${field.fieldLabel}" doit être supérieur ou égal à ${field.validation.min}`);
            }
            if (field.validation?.max !== undefined && numValue > field.validation.max) {
              errors.push(`Le champ "${field.fieldLabel}" doit être inférieur ou égal à ${field.validation.max}`);
            }
          }
          break;

        case CustomFieldType.STRING:
        case CustomFieldType.TEXTAREA:
          const strValue = String(value);
          if (field.validation?.minLength !== undefined && strValue.length < field.validation.minLength) {
            errors.push(`Le champ "${field.fieldLabel}" doit contenir au moins ${field.validation.minLength} caractères`);
          }
          if (field.validation?.maxLength !== undefined && strValue.length > field.validation.maxLength) {
            errors.push(`Le champ "${field.fieldLabel}" ne peut pas dépasser ${field.validation.maxLength} caractères`);
          }
          if (field.validation?.pattern) {
            const regex = new RegExp(field.validation.pattern);
            if (!regex.test(strValue)) {
              errors.push(`Le champ "${field.fieldLabel}" ne respecte pas le format requis`);
            }
          }
          break;

        case CustomFieldType.SELECT:
          if (field.options && !field.options.includes(String(value))) {
            errors.push(`La valeur "${value}" n'est pas valide pour le champ "${field.fieldLabel}"`);
          }
          break;

        case CustomFieldType.BOOLEAN:
          if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
            errors.push(`Le champ "${field.fieldLabel}" doit être une valeur Oui/Non`);
          }
          break;

        case CustomFieldType.DATE:
          if (isNaN(Date.parse(value))) {
            errors.push(`Le champ "${field.fieldLabel}" doit être une date valide`);
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Nettoie les valeurs personnalisées en supprimant les champs non définis
   */
  async cleanCustomValues(values: Record<string, any>): Promise<Record<string, any>> {
    const fields = await this.findActive();
    const allowedFields = new Set(fields.map(f => f.fieldName));
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(values)) {
      if (allowedFields.has(key)) {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Applique les valeurs par défaut aux champs personnalisés
   */
  async applyDefaultValues(values: Record<string, any> = {}): Promise<Record<string, any>> {
    const fields = await this.findActive();
    const result = { ...values };

    for (const field of fields) {
      if (result[field.fieldName] === undefined && field.defaultValue !== undefined && field.defaultValue !== null) {
        // Conversion du defaultValue selon le type
        switch (field.fieldType) {
          case CustomFieldType.NUMBER:
            result[field.fieldName] = Number(field.defaultValue);
            break;
          case CustomFieldType.BOOLEAN:
            result[field.fieldName] = field.defaultValue === 'true';
            break;
          default:
            result[field.fieldName] = field.defaultValue;
        }
      }
    }

    return result;
  }
} 

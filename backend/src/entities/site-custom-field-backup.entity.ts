import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { SiteCustomField, CustomFieldType } from './site-custom-field.entity';

export enum BackupAction {
  DELETE = 'DELETE',
  MODIFY = 'MODIFY'
}

@Entity('site_custom_field_backups')
export class SiteCustomFieldBackup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({
    type: 'enum',
    enum: BackupAction
  })
  action: BackupAction;

  @Column({ type: 'jsonb' })
  fieldData: {
    id: string;
    fieldName: string;
    fieldLabel: string;
    fieldType: CustomFieldType;
    required: boolean;
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
    active: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
  };

  @Column({ nullable: true })
  affectedSitesCount?: number;

  @Column({ nullable: true })
  reason?: string;

  @Column({ type: 'jsonb', nullable: true })
  affectedSitesData?: Record<string, any>; // Données des sites affectés pour restauration complète

  @Column({ default: false })
  isRestored: boolean; // Indique si cette sauvegarde a été restaurée

  @CreateDateColumn()
  createdAt: Date;
} 

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// Types de champs supportés
export enum CustomFieldType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  SELECT = 'SELECT',
  TEXTAREA = 'TEXTAREA'
}

@Entity('site_custom_fields')
export class SiteCustomField {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  fieldName: string; // Nom technique du champ (ex: "surface_totale")

  @Column()
  fieldLabel: string; // Label affiché (ex: "Surface totale")

  @Column({
    type: 'enum',
    enum: CustomFieldType
  })
  fieldType: CustomFieldType;

  @Column({ default: false })
  required: boolean;

  @Column({ nullable: true })
  defaultValue: string;

  @Column({ type: 'jsonb', nullable: true })
  options: string[]; // Pour les champs SELECT

  @Column({ type: 'jsonb', nullable: true })
  validation: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };

  @Column({ nullable: true })
  description: string; // Description/aide pour le champ

  @Column({ default: true })
  active: boolean; // Actif/inactif

  @Column({ default: 0 })
  sortOrder: number; // Ordre d'affichage

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 

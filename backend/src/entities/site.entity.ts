import { Entity, Column, PrimaryColumn, OneToMany, ManyToMany } from 'typeorm';

import { Equipment } from './equipment.entity';
import { Team } from '../teams/entities/team.entity';

// Statuts possibles d'un site
export enum SiteStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
  UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION',
  DELETED = 'DELETED',
}

// Interface conservée pour compatibilité avec l'ancien système de spécifications
export interface DynamicFieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'select';
  label: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

@Entity()
export class Site {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  region: string;

  @Column({ nullable: true })
  zone: string;

  @Column('decimal', { precision: 10, scale: 6 })
  longitude: number;

  @Column('decimal', { precision: 10, scale: 6 })
  latitude: number;

  @Column({
    type: 'varchar',
    length: 255,
    default: SiteStatus.ACTIVE
  })
  status: string;

  @Column({ nullable: true })
  oldBase: string;

  @Column({ nullable: true })
  newBase: string;



  @OneToMany(() => Equipment, equipment => equipment.site)
  equipment: Equipment[];

  @ManyToMany(() => Team, team => team.sites)
  teams: Team[];

  @Column({ 
    type: 'jsonb',
    nullable: true 
  })
  specifications: Record<string, any>;

  // Champs personnalisés dynamiques - valeurs des champs définis dans site_custom_fields
  @Column({ 
    type: 'jsonb',
    nullable: true 
  })
  customFieldsValues: Record<string, any>;

  @Column({ nullable: true })
  departmentId: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Site } from './site.entity';
import { Department } from './department.entity';
import { Team } from '../teams/entities/team.entity';

// Types d'équipement possibles
export enum EquipmentType {
  ANTENNA = 'ANTENNE',
  ROUTER = 'ROUTEUR',
  BATTERY = 'BATTERIE',
  GENERATOR = 'GÉNÉRATEUR',
  COOLING = 'REFROIDISSEMENT',
  SHELTER = 'SHELTER',
  TOWER = 'PYLÔNE',
  SECURITY = 'SÉCURITÉ',
}

// Statut des équipements
export enum EquipmentStatus {
  ACTIVE = 'ACTIF',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIF',
  PLANNED = 'PLANIFIÉ',
  UNDER_INSTALLATION = 'EN_INSTALLATION',
}

@Entity('equipment')
export class Equipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  serialNumber: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  purchaseDate: Date;

  @Column({ nullable: true })
  installDate: Date;

  @Column({ nullable: true })
  lastMaintenanceDate: Date;

  @Column({
    type: 'varchar',
    default: 'ACTIF'
  })
  status: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'float', nullable: true })
  purchasePrice: number;

  @Column({ nullable: true })
  warrantyExpiration: Date;

  @Column({ type: 'varchar', nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', nullable: true })
  macAddress: string;

  @Column({ name: 'isDeleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @ManyToOne(() => Site, site => site.equipment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'siteId' })
  site: Site;

  @Column()
  siteId: string;
  
  @ManyToOne(() => Department, department => department.equipment, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ nullable: true })
  departmentId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 
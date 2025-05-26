import { Entity, Column, PrimaryColumn, OneToMany, ManyToMany } from 'typeorm';
import { Equipment } from './equipment.entity';
import { Team } from '../teams/entities/team.entity';

// Statuts possibles d'un site
export enum SiteStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
  UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION',
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

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 
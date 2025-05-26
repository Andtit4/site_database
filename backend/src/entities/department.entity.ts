import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable, BeforeInsert } from 'typeorm';
import { Equipment } from './equipment.entity';
import { Team } from '../teams/entities/team.entity';
import { EquipmentType } from './equipment.entity';
import { v4 as uuidv4 } from 'uuid';

// Types de départements
export enum DepartmentType {
  TRANSMISSION = 'TRANSMISSION',
  ENERGIE = 'ENERGIE',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  INFORMATIQUE = 'INFORMATIQUE',
  SECURITE = 'SECURITE',
}

@Entity()
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  @Column()
  name: string;

  @Column({
    type: 'varchar',
    length: 255
  })
  type: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  responsibleName: string;

  @Column()
  contactEmail: string;

  @Column({ nullable: true, type: 'float' })
  contactPhone: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Team, team => team.department)
  teams: Team[];

  @OneToMany(() => Equipment, equipment => equipment.department)
  equipment: Equipment[];

  @Column('json', { nullable: true })
  managedEquipmentTypes: string[];

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
} 
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany, ManyToMany, JoinTable, CreateDateColumn } from 'typeorm';
import { Department } from '../../entities/department.entity';
import { Site } from '../../entities/site.entity';
import { Equipment } from '../../entities/equipment.entity';
import { EquipmentType } from '../../entities/equipment.entity';
import { User } from '../../entities/user.entity';

export enum TeamStatus {
  ACTIVE = 'ACTIVE',
  STANDBY = 'STANDBY',
  INACTIVE = 'INACTIVE',
}

@Entity()
export class Team {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: TeamStatus.ACTIVE
  })
  status: string;

  @Column({ nullable: true })
  leadName: string;

  @Column({ nullable: true })
  leadContact: string;

  @Column()
  memberCount: number;

  @Column({ nullable: true })
  location: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'date', nullable: true })
  lastActiveDate: Date;

  @Column('json', { nullable: true })
  metadata: Record<string, any>;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true
  })
  equipmentType: string;

  @ManyToOne(() => Department, department => department.teams, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column()
  departmentId: string;

  @OneToMany(() => User, user => user.team)
  users: User[];

  @ManyToMany(() => Site, site => site.teams)
  @JoinTable({
    name: 'team_sites',
    joinColumn: {
      name: 'teamId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'siteId',
      referencedColumnName: 'id',
    },
  })
  sites: Site[];

  @ManyToMany(() => Equipment)
  @JoinTable({
    name: 'team_equipment',
    joinColumn: {
      name: 'teamId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'equipmentId',
      referencedColumnName: 'id',
    },
  })
  equipment: Equipment[];

  @Column({ default: false })
  isDeleted: boolean;
} 
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, ManyToOne, JoinColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Department } from './department.entity';
import { Team } from '../teams/entities/team.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'isAdmin', type: 'boolean', default: false })
  isAdmin: boolean;

  @Column({ name: 'isDepartmentAdmin', type: 'boolean', default: false })
  isDepartmentAdmin: boolean;

  @Column({ name: 'isTeamMember', type: 'boolean', default: false })
  isTeamMember: boolean;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'isDeleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ name: 'hasDepartmentRights', type: 'boolean', default: false })
  hasDepartmentRights: boolean;

  @Column('json', { nullable: true })
  managedEquipmentTypes: string[] | null;

  @Column({ nullable: true })
  lastLogin: Date;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ nullable: true })
  departmentId: string;

  @ManyToOne(() => Team, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @Column({ nullable: true })
  teamId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 
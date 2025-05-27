import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('site_specifications')
export class SiteSpecification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  @Column({
    type: 'enum',
    enum: [
      'TOUR',
      'SHELTER',
      'PYLONE',
      'BATIMENT',
      'TOIT',
      'TERRAIN',
      'AUTRE'
    ],
    nullable: false
  })
  siteType: string;

  @Column('json', { nullable: false })
  columns: Array<{
    name: string;
    type: string;
    length?: number;
    nullable?: boolean;
    defaultValue?: string;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 

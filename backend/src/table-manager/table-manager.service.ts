import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Specification } from '../specifications/entities/specification.entity';

@Injectable()
export class TableManagerService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource
  ) {}

  async createTable(specification: Specification): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tableName = `spec_${specification.equipmentType.toLowerCase()}`;
      const columns = specification.columns.map(column => {
        let columnDefinition = `${column.name} ${column.type}`;
        if (column.type === 'varchar' && column.length) {
          columnDefinition += `(${column.length})`;
        }
        if (!column.nullable) {
          columnDefinition += ' NOT NULL';
        }
        if (column.defaultValue !== undefined) {
          if (column.type === 'int' || column.type === 'float' || column.type === 'decimal') {
            columnDefinition += column.defaultValue === '' ? ' DEFAULT NULL' : ` DEFAULT ${column.defaultValue}`;
          } else {
            columnDefinition += ` DEFAULT '${column.defaultValue}'`;
          }
        }
        return columnDefinition;
      }).join(', ');

      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id VARCHAR(36) PRIMARY KEY,
          ${columns},
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;

      await queryRunner.query(createTableQuery);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async dropTable(equipmentType: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tableName = `spec_${equipmentType.toLowerCase()}`;
      await queryRunner.query(`DROP TABLE IF EXISTS ${tableName}`);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
} 
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

interface TableDefinition {
  tableName: string;
  columns: Array<{
    name: string;
    type: string;
    length?: number;
    nullable?: boolean;
    defaultValue?: string;
  }>;
}

@Injectable()
export class TableManagerService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource
  ) {}

  async createTable(tableDefinition: TableDefinition): Promise<void> {
    const { tableName, columns } = tableDefinition;
    
    // Vérifier si la table existe déjà
    const tableExists = await this.checkTableExists(tableName);
    if (tableExists) {
      await this.dropTable(tableName);
    }

    // Créer la table
    const columnDefinitions = columns.map(column => {
      let columnDefinition = `${column.name} ${column.type.toUpperCase()}`;
      
      if (column.length) {
        columnDefinition += `(${column.length})`;
      }
      
      if (column.nullable === false) {
        columnDefinition += ' NOT NULL';
      }
      
      if (column.defaultValue !== undefined) {
        columnDefinition += ` DEFAULT '${column.defaultValue}'`;
      }
      
      return columnDefinition;
    }).join(', ');

    const query = `CREATE TABLE ${tableName} (id VARCHAR(36) PRIMARY KEY, ${columnDefinitions})`;
    
    try {
      await this.dataSource.query(query);
    } catch (error) {
      console.error(`Erreur lors de la création de la table ${tableName}:`, error);
      throw error;
    }
  }

  private async checkTableExists(tableName: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = '${tableName}'
    `;
    
    const result = await this.dataSource.query(query);
    return result[0].count > 0;
  }

  private async dropTable(tableName: string): Promise<void> {
    const query = `DROP TABLE IF EXISTS ${tableName}`;
    await this.dataSource.query(query);
  }
} 
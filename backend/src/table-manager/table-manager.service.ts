import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Specification } from '../specifications/entities/specification.entity';

// Interface pour la définition d'une table
export interface TableDefinition {
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

  async createTable(tableDefinition: TableDefinition | Specification): Promise<void> {
    // Convertir une spécification en définition de table si nécessaire
    let definition: TableDefinition;
    
    if ('tableName' in tableDefinition) {
      definition = tableDefinition as TableDefinition;
    } else {
      // C'est une spécification d'équipement, il faut la convertir
      const spec = tableDefinition as Specification;
      definition = {
        tableName: `spec_${spec.equipmentType.toLowerCase()}`,
        columns: spec.columns
      };
    }
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Vérifier si la table existe déjà
      const tableExists = await this.checkTableExists(definition.tableName);
      
      // Si la table existe, on la supprime
      if (tableExists) {
        await this.dropTable(definition.tableName);
      }
      
      // Créer la table avec les colonnes spécifiées
      let query = `CREATE TABLE ${definition.tableName} (
        id varchar(36) PRIMARY KEY,
        site_id varchar(36) NOT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`;
      
      // Ajouter les colonnes définies par l'utilisateur
      for (const column of definition.columns) {
        const columnType = column.type + (column.type.toLowerCase() === 'varchar' ? `(${column.length || 255})` : '');
        const nullableStr = column.nullable ? 'NULL' : 'NOT NULL';
        const defaultStr = column.defaultValue ? `DEFAULT '${column.defaultValue}'` : '';
        
        query += `,\n        ${column.name} ${columnType} ${nullableStr} ${defaultStr}`.trim();
      }
      
      // Fermer la définition de la table
      query += `,\n        FOREIGN KEY (site_id) REFERENCES site(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;
      
      await queryRunner.query(query);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async checkTableExists(tableName: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = ?`,
      [tableName]
    );
    
    return result[0].count > 0;
  }

  async dropTable(tableName: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
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

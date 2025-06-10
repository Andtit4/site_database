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
      
      // Créer la table avec les colonnes spécifiées (syntaxe PostgreSQL)
      let query = `CREATE TABLE "${definition.tableName}" (
        "id" character varying(36) NOT NULL,
        "site_id" character varying(36) NOT NULL,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now()`;
      
      // Ajouter les colonnes définies par l'utilisateur
      for (const column of definition.columns) {
        let columnType = column.type;
        if (column.type.toLowerCase() === 'varchar') {
          columnType = `character varying(${column.length || 255})`;
        }
        const nullableStr = column.nullable !== false ? 'NULL' : 'NOT NULL';
        const defaultStr = column.defaultValue ? `DEFAULT '${column.defaultValue}'` : '';
        
        query += `,\n        "${column.name}" ${columnType} ${nullableStr} ${defaultStr}`.trim();
      }
      
      // Fermer la définition de la table avec contraintes PostgreSQL
      query += `,\n        CONSTRAINT "PK_${definition.tableName}" PRIMARY KEY ("id"),
        CONSTRAINT "FK_${definition.tableName}_site" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE
      );`;
      
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
       WHERE table_schema = 'public' AND table_name = $1;`,
      [tableName]
    );
    
    return parseInt(result[0].count) > 0;
  }

  async dropTable(tableName: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      await queryRunner.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
} 

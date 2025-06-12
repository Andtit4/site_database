import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddSiteCustomFieldBackups1703001000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'site_custom_field_backups',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'timestamp',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'action',
            type: 'enum',
            enum: ['DELETE', 'MODIFY'],
          },
          {
            name: 'fieldData',
            type: 'jsonb',
          },
          {
            name: 'affectedSitesCount',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'affectedSitesData',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'isRestored',
            type: 'boolean',
            default: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_BACKUP_TIMESTAMP',
            columnNames: ['timestamp'],
          },
          {
            name: 'IDX_BACKUP_ACTION',
            columnNames: ['action'],
          },
          {
            name: 'IDX_BACKUP_IS_RESTORED',
            columnNames: ['isRestored'],
          },
        ],
      }),
    );

    // Index GIN pour les requêtes JSONB
    await queryRunner.query(`
      CREATE INDEX IDX_BACKUP_FIELD_DATA_GIN 
      ON site_custom_field_backups 
      USING GIN ("fieldData");
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_BACKUP_AFFECTED_SITES_DATA_GIN 
      ON site_custom_field_backups 
      USING GIN ("affectedSitesData");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('site_custom_field_backups');
  }
} 

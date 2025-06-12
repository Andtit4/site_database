import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCustomFieldTypeEnum1703001000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Mettre à jour l'enum pour utiliser les valeurs en majuscules
    await queryRunner.query(`
      -- Créer un nouvel enum avec les valeurs en majuscules
      CREATE TYPE custom_field_type_enum_new AS ENUM (
        'STRING',
        'NUMBER',
        'BOOLEAN',
        'DATE',
        'SELECT',
        'TEXTAREA'
      );
    `);

    // Mettre à jour la table pour utiliser le nouvel enum
    await queryRunner.query(`
      -- Ajouter une colonne temporaire avec le nouvel enum
      ALTER TABLE site_custom_fields 
      ADD COLUMN fieldType_new custom_field_type_enum_new;
    `);

    // Migrer les données existantes
    await queryRunner.query(`
      UPDATE site_custom_fields 
      SET fieldType_new = CASE 
        WHEN "fieldType" = 'string' THEN 'STRING'::custom_field_type_enum_new
        WHEN "fieldType" = 'number' THEN 'NUMBER'::custom_field_type_enum_new
        WHEN "fieldType" = 'boolean' THEN 'BOOLEAN'::custom_field_type_enum_new
        WHEN "fieldType" = 'date' THEN 'DATE'::custom_field_type_enum_new
        WHEN "fieldType" = 'select' THEN 'SELECT'::custom_field_type_enum_new
        WHEN "fieldType" = 'textarea' THEN 'TEXTAREA'::custom_field_type_enum_new
      END;
    `);

    // Supprimer l'ancienne colonne
    await queryRunner.query(`
      ALTER TABLE site_custom_fields DROP COLUMN "fieldType";
    `);

    // Renommer la nouvelle colonne
    await queryRunner.query(`
      ALTER TABLE site_custom_fields 
      RENAME COLUMN fieldType_new TO "fieldType";
    `);

    // Ajouter la contrainte NOT NULL
    await queryRunner.query(`
      ALTER TABLE site_custom_fields 
      ALTER COLUMN "fieldType" SET NOT NULL;
    `);

    // Supprimer l'ancien enum
    await queryRunner.query(`
      DROP TYPE IF EXISTS custom_field_type_enum;
    `);

    // Renommer le nouvel enum
    await queryRunner.query(`
      ALTER TYPE custom_field_type_enum_new RENAME TO custom_field_type_enum;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Créer l'ancien enum
    await queryRunner.query(`
      CREATE TYPE custom_field_type_enum_old AS ENUM (
        'string',
        'number',
        'boolean',
        'date',
        'select',
        'textarea'
      );
    `);

    // Ajouter une colonne temporaire avec l'ancien enum
    await queryRunner.query(`
      ALTER TABLE site_custom_fields 
      ADD COLUMN fieldType_old custom_field_type_enum_old;
    `);

    // Migrer les données vers l'ancien format
    await queryRunner.query(`
      UPDATE site_custom_fields 
      SET fieldType_old = CASE 
        WHEN "fieldType" = 'STRING' THEN 'string'::custom_field_type_enum_old
        WHEN "fieldType" = 'NUMBER' THEN 'number'::custom_field_type_enum_old
        WHEN "fieldType" = 'BOOLEAN' THEN 'boolean'::custom_field_type_enum_old
        WHEN "fieldType" = 'DATE' THEN 'date'::custom_field_type_enum_old
        WHEN "fieldType" = 'SELECT' THEN 'select'::custom_field_type_enum_old
        WHEN "fieldType" = 'TEXTAREA' THEN 'textarea'::custom_field_type_enum_old
      END;
    `);

    // Supprimer la nouvelle colonne
    await queryRunner.query(`
      ALTER TABLE site_custom_fields DROP COLUMN "fieldType";
    `);

    // Renommer l'ancienne colonne
    await queryRunner.query(`
      ALTER TABLE site_custom_fields 
      RENAME COLUMN fieldType_old TO "fieldType";
    `);

    // Ajouter la contrainte NOT NULL
    await queryRunner.query(`
      ALTER TABLE site_custom_fields 
      ALTER COLUMN "fieldType" SET NOT NULL;
    `);

    // Supprimer le nouvel enum
    await queryRunner.query(`
      DROP TYPE IF EXISTS custom_field_type_enum;
    `);

    // Renommer l'ancien enum
    await queryRunner.query(`
      ALTER TYPE custom_field_type_enum_old RENAME TO custom_field_type_enum;
    `);
  }
} 
